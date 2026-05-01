import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import { analyticsRepository } from './analytics.repository.js'
import type {
  AnalyticsEventsQuery,
  AnalyticsSummary,
  ClicksByDayItem,
  ClicksByDayQuery,
  PaginatedAnalyticsEvents,
  TopLinkItem,
} from './analytics.types.js'

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
}

export const analyticsService = new AnalyticsService()

