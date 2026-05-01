import { prisma } from '../../shared/config/prisma.js'
import type {
  CreateAccessEventInput,
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

  async createAccessEvent(data: CreateAccessEventInput): Promise<void> {
    await prisma.linkAccessEvent.create({
      data: {
        shortLinkId: data.shortLinkId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referer: data.referer,
      },
    })
  }

  async incrementClickCount(shortLinkId: string): Promise<void> {
    await prisma.shortLink.update({
      where: {
        id: shortLinkId,
      },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    })
  }
}

export const redirectsRepository = new RedirectsRepository()
