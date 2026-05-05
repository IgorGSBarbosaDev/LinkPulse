import { prisma } from '../../shared/config/prisma.js'

export class EmailVerificationRepository {
  static create(data: {
    userId: string
    tokenHash: string
    expiresAt: Date
  }) {
    return prisma.emailVerificationToken.create({
      data,
    })
  }

  static findByTokenHash(tokenHash: string) {
    return prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          select: {
            id: true,
            emailVerifiedAt: true,
          },
        },
      },
    })
  }

  static markUsed(id: string, usedAt: Date) {
    return prisma.emailVerificationToken.update({
      where: {
        id,
      },
      data: {
        usedAt,
      },
    })
  }

  static revokeUnusedByUserId(userId: string, revokedAt: Date) {
    return prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    })
  }

  static markUserVerified(userId: string, emailVerifiedAt: Date) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerifiedAt,
      },
    })
  }
}
