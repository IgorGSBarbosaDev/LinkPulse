import { Prisma } from '@prisma/client'
import { prisma } from '../../shared/config/prisma.js'

type OwnedLinkRecord = {
  id: string
  shortCode: string
  clickCount: number
}

type ClicksByDayRow = {
  date: string
  clicks: bigint
}

class AnalyticsRepository {
  async findOwnedLinkOrNull(
    linkId: string,
    userId: string,
  ): Promise<OwnedLinkRecord | null> {
    return prisma.shortLink.findFirst({
      where: {
        id: linkId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        shortCode: true,
        clickCount: true,
      },
    })
  }

  async countEventsInRange(
    linkId: string,
    start: Date,
    endExclusive: Date,
  ): Promise<number> {
    return prisma.linkAccessEvent.count({
      where: {
        shortLinkId: linkId,
        accessedAt: {
          gte: start,
          lt: endExclusive,
        },
      },
    })
  }

  async findLastAccessAt(linkId: string): Promise<Date | null> {
    const lastEvent = await prisma.linkAccessEvent.findFirst({
      where: {
        shortLinkId: linkId,
      },
      orderBy: {
        accessedAt: 'desc',
      },
      select: {
        accessedAt: true,
      },
    })

    return lastEvent?.accessedAt ?? null
  }

  async findClicksByDay(
    linkId: string,
    start: Date,
    endExclusive: Date,
  ): Promise<Array<{ date: string; clicks: number }>> {
    const rows = await prisma.$queryRaw<ClicksByDayRow[]>(Prisma.sql`
      SELECT
        to_char(date_trunc('day', "accessedAt"), 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS clicks
      FROM "link_access_events"
      WHERE "shortLinkId" = ${linkId}::uuid
        AND "accessedAt" >= ${start}
        AND "accessedAt" < ${endExclusive}
      GROUP BY date_trunc('day', "accessedAt")
      ORDER BY date_trunc('day', "accessedAt") ASC
    `)

    return rows.map((row) => ({
      date: row.date,
      clicks: Number(row.clicks),
    }))
  }

  async listEvents(linkId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [events, totalItems] = await prisma.$transaction([
      prisma.linkAccessEvent.findMany({
        where: {
          shortLinkId: linkId,
        },
        orderBy: {
          accessedAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          accessedAt: true,
          ipAddress: true,
          userAgent: true,
          referer: true,
        },
      }),
      prisma.linkAccessEvent.count({
        where: {
          shortLinkId: linkId,
        },
      }),
    ])

    return {
      events,
      totalItems,
    }
  }

  async listTopLinks(userId: string) {
    return prisma.shortLink.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        clickCount: 'desc',
      },
      select: {
        id: true,
        title: true,
        shortCode: true,
        clickCount: true,
      },
    })
  }
}

export const analyticsRepository = new AnalyticsRepository()

