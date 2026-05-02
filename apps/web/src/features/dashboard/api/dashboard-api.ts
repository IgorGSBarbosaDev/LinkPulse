import {
  getLinkAnalyticsEvents,
  getLinkAnalyticsSummary,
  getLinkClicksByDay,
} from '../../analytics/api/analytics-api'
import type { ClicksByDayParams } from '../../analytics/types'
import { listLinks } from '../../links/api/links-api'
import type {
  DashboardData,
  DashboardLink,
  DashboardRangePreset,
  DashboardRecentLink,
} from '../types'
import {
  buildDashboardSummary,
  mergeClicksByDay,
} from '../utils/dashboard-metrics'

const dashboardLinkLimit = 100
const recentEventsPerLink = 3
const recentLinksLimit = 10

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

function toRangeDates(
  range: DashboardRangePreset,
  now = new Date(),
): Required<ClicksByDayParams> {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const from = new Date(today)

  switch (range) {
    case '1m':
      from.setUTCMonth(today.getUTCMonth() - 1)
      break
    case '3m':
      from.setUTCMonth(today.getUTCMonth() - 3)
      break
    case '6m':
      from.setUTCMonth(today.getUTCMonth() - 6)
      break
    case '1y':
      from.setUTCFullYear(today.getUTCFullYear() - 1)
      break
  }

  return {
    from: toDateOnly(from),
    to: toDateOnly(today),
  }
}

async function listAllDashboardLinks() {
  const firstPage = await listLinks({
    page: 1,
    limit: dashboardLinkLimit,
    sort: 'createdAt',
    order: 'desc',
  })

  const remainingPages =
    firstPage.pagination.totalPages > 1
      ? await Promise.all(
          Array.from({ length: firstPage.pagination.totalPages - 1 }, (_, index) =>
            listLinks({
              page: index + 2,
              limit: dashboardLinkLimit,
              sort: 'createdAt',
              order: 'desc',
            }),
          ),
        )
      : []

  return [firstPage, ...remainingPages].flatMap((page) => page.data)
}

function toRecentLinks(
  links: DashboardLink[],
  groups: Awaited<ReturnType<typeof getLinkAnalyticsEvents>>[],
): DashboardRecentLink[] {
  const linkById = new Map(links.map((link) => [link.id, link]))
  const mostRecentByLink = new Map<string, DashboardRecentLink>()

  const sortedEvents = groups
    .flatMap((group, index) => {
      const link = links[index]
      return group.data.map((event) => ({ ...event, linkId: link.id }))
    })
    .sort(
      (left, right) =>
        new Date(right.accessedAt).getTime() - new Date(left.accessedAt).getTime(),
    )

  for (const event of sortedEvents) {
    if (mostRecentByLink.has(event.linkId)) {
      continue
    }

    const link = linkById.get(event.linkId)

    if (!link) {
      continue
    }

    mostRecentByLink.set(event.linkId, {
      linkId: link.id,
      shortCode: link.shortCode,
      shortUrl: link.shortUrl,
      title: link.title ?? null,
      active: link.active,
      clickCount: link.clickCount,
      lastAccessAt: event.accessedAt,
    })
  }

  return Array.from(mostRecentByLink.values()).slice(0, recentLinksLimit)
}

export async function getDashboardData(
  range: DashboardRangePreset,
): Promise<DashboardData> {
  const links = await listAllDashboardLinks()

  if (!links.length) {
    return {
      links,
      summary: buildDashboardSummary([], []),
      clicksByDay: [],
      recentLinks: [],
      isPartial: false,
    }
  }

  const dateRange = toRangeDates(range)
  const [summaries, clicksByDayGroups, eventGroups] = await Promise.all([
    Promise.all(links.map((link) => getLinkAnalyticsSummary(link.id))),
    Promise.all(
      links.map((link) => getLinkClicksByDay(link.id, dateRange)),
    ),
    Promise.all(
      links.map((link) =>
        getLinkAnalyticsEvents(link.id, {
          page: 1,
          limit: recentEventsPerLink,
        }),
      ),
    ),
  ])

  return {
    links,
    summary: buildDashboardSummary(links, summaries),
    clicksByDay: mergeClicksByDay(clicksByDayGroups),
    recentLinks: toRecentLinks(links, eventGroups),
    isPartial: false,
  }
}
