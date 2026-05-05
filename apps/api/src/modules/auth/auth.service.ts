import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { prisma } from '../../shared/config/prisma.js'
import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import { EmailVerificationService } from '../email-verification/email-verification.service.js'
import { emailService } from '../email/email.service.js'
import { normalizeEmail } from '../../shared/utils/normalize-email.js'
import type {
  AuthResponse,
  AuthUser,
  JwtPayload,
  LoginInput,
  MessageResponse,
  ResendVerificationEmailInput,
  RegisteredUser,
  RegisterResponse,
  RegisterInput,
  VerifyEmailInput,
} from './auth.types.js'

const PASSWORD_SALT_ROUNDS = 10
const DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600

function expiresInToSeconds(expiresIn: string): number {
  if (/^\d+$/.test(expiresIn)) {
    return Number(expiresIn)
  }

  const match = expiresIn.trim().match(/^(\d+)([smhd])$/i)
  if (!match) {
    throw AppError.internal('Invalid JWT_EXPIRES_IN format.')
  }

  const amountString = match[1]
  const unitString = match[2]

  if (!amountString || !unitString) {
    throw AppError.internal('Invalid JWT_EXPIRES_IN format.')
  }

  const amount = Number(amountString)
  const unit = unitString.toLowerCase()

  if (unit === 's') return amount
  if (unit === 'm') return amount * 60
  if (unit === 'h') return amount * 60 * 60
  return amount * 24 * 60 * 60
}

const JWT_EXPIRES_IN_FOR_SIGN =
  env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>

const ACCESS_TOKEN_EXPIRES_IN_SECONDS =
  expiresInToSeconds(env.JWT_EXPIRES_IN) || DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS

export class AuthService {
  static async register(input: RegisterInput): Promise<RegisterResponse> {
    const email = normalizeEmail(input.email)
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      throw new AppError({
        statusCode: 409,
        message: 'Email already registered',
        error: 'Conflict',
      })
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      PASSWORD_SALT_ROUNDS,
    )

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        emailVerifiedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    })

    const verificationToken = await EmailVerificationService.createToken(user.id)
    const verificationUrl = this.buildVerificationUrl(verificationToken.token)

    try {
      await emailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl,
        expirationMinutes: env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES,
      })
    } catch {
      throw AppError.internal(
        'Account created, but verification email could not be sent. Please try resending the verification email.',
      )
    }

    return {
      message: 'Account created. Please verify your email before logging in.',
      emailVerificationRequired: true,
      user,
    }
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const email = normalizeEmail(input.email)
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new AppError({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      })
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    )

    if (!passwordMatches) {
      throw new AppError({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      })
    }

    if (!user.emailVerifiedAt) {
      throw AppError.forbidden(
        'Please verify your email before logging in.',
        undefined,
        'EMAIL_NOT_VERIFIED',
      )
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    }

    const accessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
    })

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      user: authUser,
    }
  }

  static async verifyEmail(
    input: VerifyEmailInput,
  ): Promise<MessageResponse> {
    return EmailVerificationService.verifyToken(input.token)
  }

  static async resendVerificationEmail(
    input: ResendVerificationEmailInput,
  ): Promise<MessageResponse> {
    const genericResponse = {
      message:
        'If this email is registered and not verified, a new verification link will be sent.',
    }
    const email = normalizeEmail(input.email)
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
      },
    })

    if (!user || user.emailVerifiedAt) {
      return genericResponse
    }

    const verificationToken = await EmailVerificationService.resendToken(user.id)

    try {
      await emailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: this.buildVerificationUrl(verificationToken.token),
        expirationMinutes: env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES,
      })
    } catch {
      throw AppError.internal(
        'Verification email could not be sent. Please try again later.',
      )
    }

    return genericResponse
  }

  static async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      throw new AppError({
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      })
    }

    return user
  }

  private static generateAccessToken(payload: JwtPayload): string {
    const secret = env.JWT_SECRET

    if (!secret) {
      throw new AppError({
        statusCode: 500,
        message: 'JWT secret not configured',
        error: 'Internal Server Error',
      })
    }

    return jwt.sign(payload, secret, {
      expiresIn: JWT_EXPIRES_IN_FOR_SIGN,
    })
  }

  private static buildVerificationUrl(token: string): string {
    const url = new URL(env.EMAIL_VERIFICATION_URL)
    url.searchParams.set('token', token)

    return url.toString()
  }
}
