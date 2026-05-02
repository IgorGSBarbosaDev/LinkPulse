import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { prisma } from '../../shared/config/prisma.js'
import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  AuthResponse,
  AuthUser,
  JwtPayload,
  LoginInput,
  RegisteredUser,
  RegisterInput,
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
  static async register(input: RegisterInput): Promise<RegisteredUser> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
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
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return user
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
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
}
