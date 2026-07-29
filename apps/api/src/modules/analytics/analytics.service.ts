import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import { analyticsRepository } from './analytics.repository.js'
import type {
  AnalyticsEventsQuery,
  AnalyticsSummary,
  ClicksByDayItem,
  ClicksByDayQuery,
  DashboardData,
  DashboardQuery,
  PaginatedAnalyticsEvents,
  TopLinkItem,
} from './analytics.types.js'
import { buildShortUrl } from '../links/links.mapper.js'

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  )
}

function addUtcDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000)
}

function parseDateOnlyToUtc(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00.000Z`)
}

class AnalyticsService {
  async getSummary(userId: string, linkId: string): Promise<AnalyticsSummary> {
    const link = await this.getOwnedLinkOrFail(userId, linkId)

    const now = new Date()
    const todayStart = startOfUtcDay(now)
    const tomorrowStart = addUtcDays(todayStart, 1)
    const last7DaysStart = addUtcDays(todayStart, -6)

    const [clicksToday, clicksLast7Days, lastAccessAt] = await Promise.all([
      analyticsRepository.countEventsInRange(link.id, todayStart, tomorrowStart),
      analyticsRepository.countEventsInRange(
        link.id,
        last7DaysStart,
        tomorrowStart,
      ),
      analyticsRepository.findLastAccessAt(link.id),
    ])

    return {
      linkId: link.id,
      shortCode: link.shortCode,
      totalClicks: link.clickCount,
      clicksToday,
      clicksLast7Days,
      lastAccessAt,
    }
  }

  async getClicksByDay(
    userId: string,
    linkId: string,
    query: ClicksByDayQuery,
  ): Promise<ClicksByDayItem[]> {
    const link = await this.getOwnedLinkOrFail(userId, linkId)
    const { start, endExclusive } = this.resolveDateRange(query)

    return analyticsRepository.findClicksByDay(link.id, start, endExclusive)
  }

  async getEvents(
    userId: string,
    linkId: string,
    query: AnalyticsEventsQuery,
  ): Promise<PaginatedAnalyticsEvents> {
    const link = await this.getOwnedLinkOrFail(userId, linkId)
    const { events, totalItems } = await analyticsRepository.listEvents(
      link.id,
      query.page,
      query.limit,
    )

    return {
      data: events,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit) || 1,
      },
    }
  }

  async getTopLinks(userId: string): Promise<TopLinkItem[]> {
    const links = await analyticsRepository.listTopLinks(userId)

    return links.map((link) => ({
      id: link.id,
      title: link.title,
      shortCode: link.shortCode,
      shortUrl: `${env.APP_BASE_URL}/r/${link.shortCode}`,
      clickCount: link.clickCount,
    }))
  }

  async getDashboard(
    userId: string,
    query: DashboardQuery,
  ): Promise<DashboardData> {
    const { start, endExclusive } = this.resolveDashboardDateRange(query)
    const { links, clicksByDay, recentEvents } =
      await analyticsRepository.getDashboardData(userId, start, endExclusive)

    const today = toDateOnly(startOfUtcDay(new Date()))
    const last7DaysStart = toDateOnly(addUtcDays(startOfUtcDay(new Date()), -6))
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)

    const topLinks = [...links]
      .sort((left, right) => right.clickCount - left.clickCount)
      .slice(0, 10)
      .map((link) => ({
        id: link.id,
        title: link.title,
        shortCode: link.shortCode,
        shortUrl: buildShortUrl(link.shortCode),
        clickCount: link.clickCount,
      }))

    const recentLinks = recentEvents.map((event) => ({
        linkId: event.linkId,
        shortCode: event.shortCode,
        shortUrl: buildShortUrl(event.shortCode),
        title: event.title,
        active: event.active,
        clickCount: event.clickCount,
        lastAccessAt: event.accessedAt,
      }))

    return {
      summary: {
        totalLinks: links.length,
        totalClicks,
        activeLinks: links.filter((link) => link.active).length,
        clicksToday: clicksByDay
          .filter((item) => item.date === today)
          .reduce((sum, item) => sum + item.clicks, 0),
        clicksLast7Days: clicksByDay
          .filter((item) => item.date >= last7DaysStart)
          .reduce((sum, item) => sum + item.clicks, 0),
      },
      clicksByDay,
      topLinks,
      recentLinks,
    }
  }

  private async getOwnedLinkOrFail(userId: string, linkId: string) {
    const link = await analyticsRepository.findOwnedLinkOrNull(linkId, userId)

    if (!link) {
      throw AppError.notFound('Link not found.')
    }

    return link
  }

  private resolveDateRange(query: ClicksByDayQuery): {
    start: Date
    endExclusive: Date
  } {
    if (query.from && query.to) {
      const start = parseDateOnlyToUtc(query.from)
      const to = parseDateOnlyToUtc(query.to)

      return {
        start,
        endExclusive: addUtcDays(to, 1),
      }
    }

    const todayStart = startOfUtcDay(new Date())
    return {
      start: addUtcDays(todayStart, -6),
      endExclusive: addUtcDays(todayStart, 1),
    }
  }

  private resolveDashboardDateRange(query: DashboardQuery): {
    start: Date
    endExclusive: Date
  } {
    const todayStart = startOfUtcDay(new Date())
    const start = new Date(todayStart)

    switch (query.range) {
      case '1m':
        start.setUTCMonth(start.getUTCMonth() - 1)
        break
      case '3m':
        start.setUTCMonth(start.getUTCMonth() - 3)
        break
      case '6m':
        start.setUTCMonth(start.getUTCMonth() - 6)
        break
      case '1y':
        start.setUTCFullYear(start.getUTCFullYear() - 1)
        break
    }

    return {
      start,
      endExclusive: addUtcDays(todayStart, 1),
    }
  }
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

export const analyticsService = new AnalyticsService()

