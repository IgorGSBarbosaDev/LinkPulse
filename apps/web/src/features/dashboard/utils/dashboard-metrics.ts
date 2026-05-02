import type { ClicksByDayItem } from '../../analytics/types'
import type {
  DashboardLink,
  DashboardLinkSummary,
  DashboardSummary,
} from '../types'

export function buildDashboardSummary(
  links: DashboardLink[],
  summaries: DashboardLinkSummary[],
): DashboardSummary {
  return {
    totalLinks: links.length,
    totalClicks: summaries.reduce((sum, item) => sum + item.totalClicks, 0),
    activeLinks: links.filter((link) => link.active).length,
    expiredLinks: links.filter((link) => link.expired).length,
    clicksLast7Days: summaries.reduce(
      (sum, item) => sum + item.clicksLast7Days,
      0,
    ),
  }
}

export function mergeClicksByDay(
  groups: ClicksByDayItem[][],
): ClicksByDayItem[] {
  const clicksByDate = new Map<string, number>()

  for (const group of groups) {
    for (const item of group) {
      clicksByDate.set(item.date, (clicksByDate.get(item.date) ?? 0) + item.clicks)
    }
  }

  return Array.from(clicksByDate.entries())
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((left, right) => left.date.localeCompare(right.date))
}
