import { Prisma, type ShortLink } from '@prisma/client'
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

type DashboardRecentEvent = {
  id: string
  accessedAt: Date
  linkId: string
  shortCode: string
  title: string | null
  active: boolean
  clickCount: number
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

  async getDashboardData(
    userId: string,
    start: Date,
    endExclusive: Date,
  ): Promise<{
    links: ShortLink[]
    clicksByDay: Array<{ date: string; clicks: number }>
    recentEvents: DashboardRecentEvent[]
  }> {
    const [links, clicksByDayRows, recentEvents] = await Promise.all([
      prisma.shortLink.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.$queryRaw<ClicksByDayRow[]>(Prisma.sql`
        SELECT
          to_char(date_trunc('day', e."accessedAt"), 'YYYY-MM-DD') AS date,
          COUNT(*)::bigint AS clicks
        FROM "link_access_events" e
        INNER JOIN "short_links" l ON l."id" = e."shortLinkId"
        WHERE l."userId" = ${userId}::uuid
          AND l."deletedAt" IS NULL
          AND e."accessedAt" >= ${start}
          AND e."accessedAt" < ${endExclusive}
        GROUP BY date_trunc('day', e."accessedAt")
        ORDER BY date_trunc('day', e."accessedAt") ASC
      `),
      prisma.$queryRaw<DashboardRecentEvent[]>(Prisma.sql`
        SELECT
          latest."id",
          latest."accessedAt",
          latest."linkId",
          latest."shortCode",
          latest."title",
          latest."active",
          latest."clickCount"
        FROM (
          SELECT DISTINCT ON (e."shortLinkId")
            e."id",
            e."accessedAt",
            l."id" AS "linkId",
            l."shortCode",
            l."title",
            l."active",
            l."clickCount"
          FROM "link_access_events" e
          INNER JOIN "short_links" l ON l."id" = e."shortLinkId"
          WHERE l."userId" = ${userId}::uuid
            AND l."deletedAt" IS NULL
          ORDER BY e."shortLinkId", e."accessedAt" DESC
        ) latest
        ORDER BY latest."accessedAt" DESC
        LIMIT 10
      `),
    ])

    return {
      links,
      clicksByDay: clicksByDayRows.map((row) => ({
        date: row.date,
        clicks: Number(row.clicks),
      })),
      recentEvents,
    }
  }
}

export const analyticsRepository = new AnalyticsRepository()

