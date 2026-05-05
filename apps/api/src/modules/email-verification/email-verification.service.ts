import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import { generateSecureToken } from '../../shared/utils/generate-secure-token.js'
import { hashToken } from '../../shared/utils/hash-token.js'
import { EmailVerificationRepository } from './email-verification.repository.js'
import type {
  CreatedEmailVerificationToken,
  EmailVerificationResult,
} from './email-verification.types.js'

export class EmailVerificationService {
  static async createToken(
    userId: string,
  ): Promise<CreatedEmailVerificationToken> {
    const token = generateSecureToken()
    const tokenHash = hashToken(token)
    const expiresAt = this.calculateExpiresAt()

    await EmailVerificationRepository.create({
      userId,
      tokenHash,
      expiresAt,
    })

    return {
      token,
      expiresAt,
    }
  }

  static async resendToken(
    userId: string,
  ): Promise<CreatedEmailVerificationToken> {
    await EmailVerificationRepository.revokeUnusedByUserId(userId, new Date())

    return this.createToken(userId)
  }

  static async verifyToken(token: string): Promise<EmailVerificationResult> {
    const tokenHash = hashToken(token)
    const tokenRecord = await EmailVerificationRepository.findByTokenHash(
      tokenHash,
    )

    if (!tokenRecord) {
      throw AppError.badRequest(
        'Invalid verification token.',
        undefined,
        'INVALID_VERIFICATION_TOKEN',
      )
    }

    if (tokenRecord.usedAt) {
      throw AppError.conflict(
        'Verification token has already been used.',
        undefined,
        'VERIFICATION_TOKEN_ALREADY_USED',
      )
    }

    if (tokenRecord.revokedAt) {
      throw AppError.gone(
        'Verification token has been revoked.',
        undefined,
        'VERIFICATION_TOKEN_REVOKED',
      )
    }

    if (tokenRecord.expiresAt.getTime() <= Date.now()) {
      throw AppError.gone(
        'Verification token has expired.',
        undefined,
        'VERIFICATION_TOKEN_EXPIRED',
      )
    }

    const now = new Date()

    if (!tokenRecord.user.emailVerifiedAt) {
      await EmailVerificationRepository.markUserVerified(
        tokenRecord.userId,
        now,
      )
    }

    await EmailVerificationRepository.markUsed(tokenRecord.id, now)

    if (tokenRecord.user.emailVerifiedAt) {
      return {
        message: 'Email is already verified.',
      }
    }

    return {
      message: 'Email verified successfully. You can now log in.',
    }
  }

  private static calculateExpiresAt(): Date {
    const expiresInMs =
      env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES * 60 * 1000

    return new Date(Date.now() + expiresInMs)
  }
}
