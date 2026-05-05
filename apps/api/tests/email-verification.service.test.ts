import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EmailVerificationService } from '../src/modules/email-verification/email-verification.service.js'
import { prisma } from '../src/shared/config/prisma.js'

vi.mock('../src/shared/config/prisma.js', () => ({
  prisma: {
    emailVerificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => callback(prisma)),
  },
}))

vi.mock('../src/shared/config/env.js', () => ({
  env: {
    EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES: 60,
  },
}))

const mockedPrisma = vi.mocked(prisma)

describe('EmailVerificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates token record with hash only', async () => {
    mockedPrisma.emailVerificationToken.create.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hash',
      expiresAt: new Date('2026-05-04T21:00:00.000Z'),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date('2026-05-04T20:00:00.000Z'),
    })

    const result = await EmailVerificationService.createToken('user-id')

    expect(result.token).toMatch(/^[a-f0-9]{64}$/)
    expect(mockedPrisma.emailVerificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-id',
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      }),
    })
    expect(
      mockedPrisma.emailVerificationToken.create.mock.calls[0]?.[0].data.tokenHash,
    ).not.toBe(result.token)
  })

  it('verifies valid token and marks account verified', async () => {
    mockedPrisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
      user: {
        id: 'user-id',
        emailVerifiedAt: null,
      },
    })
    mockedPrisma.user.update.mockResolvedValue({})
    mockedPrisma.emailVerificationToken.update.mockResolvedValue({})

    await expect(
      EmailVerificationService.verifyToken('plain-token'),
    ).resolves.toEqual({
      message: 'Email verified successfully. You can now log in.',
    })

    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { emailVerifiedAt: expect.any(Date) },
    })
    expect(mockedPrisma.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: 'token-id' },
      data: { usedAt: expect.any(Date) },
    })
  })

  it('rejects expired token with controlled code', async () => {
    mockedPrisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hash',
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
      user: {
        id: 'user-id',
        emailVerifiedAt: null,
      },
    })

    await expect(
      EmailVerificationService.verifyToken('plain-token'),
    ).rejects.toMatchObject({
      statusCode: 410,
      code: 'VERIFICATION_TOKEN_EXPIRED',
    })
  })

  it('revokes unused tokens before resend token creation', async () => {
    mockedPrisma.emailVerificationToken.updateMany.mockResolvedValue({ count: 2 })
    mockedPrisma.emailVerificationToken.create.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hash',
      expiresAt: new Date(),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    })

    await EmailVerificationService.resendToken('user-id')

    expect(mockedPrisma.emailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    })
  })
})
