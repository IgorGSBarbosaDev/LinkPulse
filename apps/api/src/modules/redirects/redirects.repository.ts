import { Prisma } from '@prisma/client'
import { prisma } from '../../shared/config/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
  RecordAccessAndIncrementInput,
  RedirectLinkRecord,
} from './redirects.types.js'

class RedirectsRepository {
  async findRedirectLinkByShortCode(
    shortCode: string,
  ): Promise<RedirectLinkRecord | null> {
    return prisma.shortLink.findUnique({
      where: {
        shortCode,
      },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        active: true,
        expiresAt: true,
        maxClicks: true,
        clickCount: true,
        deletedAt: true,
      },
    })
  }

  async recordAccessAndIncrementClickCount(
    data: RecordAccessAndIncrementInput,
  ): Promise<number> {
    return prisma.$transaction(async (tx) => {
      // The predicate and increment execute while PostgreSQL holds the row
      // lock. This prevents concurrent redirects from exceeding maxClicks.
      const updatedRows = await tx.$queryRaw<Array<{ clickCount: number }>>(
        Prisma.sql`
          UPDATE "short_links"
          SET
            "clickCount" = "clickCount" + 1,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE "id" = ${data.shortLinkId}::uuid
            AND "deletedAt" IS NULL
            AND "active" = true
            AND ("expiresAt" IS NULL OR "expiresAt" > CURRENT_TIMESTAMP)
            AND ("maxClicks" IS NULL OR "clickCount" < "maxClicks")
          RETURNING "clickCount"
        `,
      )

      const updatedLink = updatedRows[0]

      if (!updatedLink) {
        const currentLink = await tx.shortLink.findUnique({
          where: { id: data.shortLinkId },
          select: { id: true, deletedAt: true },
        })

        if (!currentLink || currentLink.deletedAt !== null) {
          throw AppError.notFound('Link not found.')
        }

        throw AppError.gone('Link is no longer available.')
      }

      await tx.linkAccessEvent.create({
        data: {
          shortLinkId: data.shortLinkId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referer: data.referer,
        },
      })

      return updatedLink.clickCount
    })
  }
}

export const redirectsRepository = new RedirectsRepository()
