import bcrypt from 'bcrypt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../src/modules/auth/auth.service.js'
import { EmailVerificationService } from '../src/modules/email-verification/email-verification.service.js'
import { emailService } from '../src/modules/email/email.service.js'
import { prisma } from '../src/shared/config/prisma.js'

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'jwt-token'),
  },
}))

vi.mock('../src/shared/config/env.js', () => ({
  env: {
    JWT_EXPIRES_IN: '1h',
    JWT_SECRET: 'secret-with-enough-length',
    EMAIL_VERIFICATION_URL: 'http://localhost:5173/verify-email',
    EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES: 60,
  },
}))

vi.mock('../src/shared/config/prisma.js', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../src/modules/email-verification/email-verification.service.js', () => ({
  EmailVerificationService: {
    createToken: vi.fn(),
  },
}))

vi.mock('../src/modules/email/email.service.js', () => ({
  emailService: {
    sendVerificationEmail: vi.fn(),
  },
}))

const mockedBcrypt = vi.mocked(bcrypt)
const mockedPrisma = vi.mocked(prisma)
const mockedEmailVerificationService = vi.mocked(EmailVerificationService)
const mockedEmailService = vi.mocked(emailService)

describe('AuthService email verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers user as unverified, sends email, and returns no token', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null)
    mockedBcrypt.hash.mockResolvedValue('hashed-password' as never)
    mockedPrisma.user.create.mockResolvedValue({
      id: 'user-id',
      name: 'Igor',
      email: 'igor@email.com',
      emailVerifiedAt: null,
      createdAt: new Date('2026-05-04T20:00:00.000Z'),
    })
    mockedEmailVerificationService.createToken.mockResolvedValue({
      token: 'plain-token',
      expiresAt: new Date('2026-05-04T21:00:00.000Z'),
    })

    const result = await AuthService.register({
      name: 'Igor',
      email: ' Igor@Email.COM ',
      password: '12345',
    })

    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Igor',
        email: 'igor@email.com',
        passwordHash: 'hashed-password',
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
    expect(mockedEmailService.sendVerificationEmail).toHaveBeenCalledWith({
      to: 'igor@email.com',
      name: 'Igor',
      verificationUrl: 'http://localhost:5173/verify-email?token=plain-token',
      expirationMinutes: 60,
    })
    expect(result).toMatchObject({
      emailVerificationRequired: true,
      message: 'Account created. Please verify your email before logging in.',
    })
    expect(result).not.toHaveProperty('accessToken')
  })

  it('blocks login for correct password when email is unverified', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Igor',
      email: 'igor@email.com',
      passwordHash: 'hashed-password',
      emailVerifiedAt: null,
    })
    mockedBcrypt.compare.mockResolvedValue(true as never)

    await expect(
      AuthService.login({ email: 'igor@email.com', password: '12345' }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'EMAIL_NOT_VERIFIED',
    })
  })

  it('keeps invalid password error generic for unverified accounts', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Igor',
      email: 'igor@email.com',
      passwordHash: 'hashed-password',
      emailVerifiedAt: null,
    })
    mockedBcrypt.compare.mockResolvedValue(false as never)

    await expect(
      AuthService.login({ email: 'igor@email.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  })
})
