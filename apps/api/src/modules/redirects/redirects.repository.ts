import { prisma } from '../../shared/config/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import { hasReachedMaxClicks, isLinkExpired } from '../links/links.mapper.js'
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
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const currentLink = await tx.shortLink.findUnique({
        where: {
          id: data.shortLinkId,
        },
        select: {
          id: true,
          active: true,
          expiresAt: true,
          maxClicks: true,
          clickCount: true,
          deletedAt: true,
        },
      })

      if (!currentLink || currentLink.deletedAt !== null) {
        throw AppError.notFound('Link not found.')
      }

      if (!currentLink.active || isLinkExpired(currentLink) || hasReachedMaxClicks(currentLink)) {
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

      await tx.shortLink.update({
        where: {
          id: data.shortLinkId,
        },
        data: {
          clickCount: {
            increment: 1,
          },
        },
      })
    })
  }
}

export const redirectsRepository = new RedirectsRepository()
