import {
  getLinkAnalyticsEvents,
  getLinkAnalyticsSummary,
  getLinkClicksByDay,
  getTopLinks,
} from '../../analytics/api/analytics-api'
import { getDefaultDateRange } from '../../analytics/utils/analytics-date-range'
import { listLinks } from '../../links/api/links-api'
import type { DashboardData, DashboardLink, DashboardRecentEvent } from '../types'
import {
  buildDashboardSummary,
  mergeClicksByDay,
} from '../utils/dashboard-metrics'

const dashboardLinkLimit = 100
const recentEventsPerLink = 3
const recentEventsLimit = 10

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

function toRecentEvents(
  links: DashboardLink[],
  groups: Awaited<ReturnType<typeof getLinkAnalyticsEvents>>[],
): DashboardRecentEvent[] {
  const linkById = new Map(links.map((link) => [link.id, link]))

  return groups
    .flatMap((group, index) => {
      const link = links[index]
      return group.data.map((event) => ({
        ...event,
        linkId: link.id,
        shortCode: link.shortCode,
        title: linkById.get(link.id)?.title ?? null,
      }))
    })
    .sort(
      (left, right) =>
        new Date(right.accessedAt).getTime() - new Date(left.accessedAt).getTime(),
    )
    .slice(0, recentEventsLimit)
}

export async function getDashboardData(): Promise<DashboardData> {
  const links = await listAllDashboardLinks()

  if (!links.length) {
    return {
      links,
      summary: buildDashboardSummary([], []),
      topLinks: [],
      clicksByDay: [],
      recentEvents: [],
      isPartial: false,
    }
  }

  const dateRange = getDefaultDateRange()
  const [topLinks, summaries, clicksByDayGroups, eventGroups] =
    await Promise.all([
      getTopLinks(),
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
    topLinks,
    clicksByDay: mergeClicksByDay(clicksByDayGroups),
    recentEvents: toRecentEvents(links, eventGroups),
    isPartial: false,
  }
}
