import type {
  AnalyticsEventItem,
  AnalyticsSummary,
  ClicksByDayItem,
  TopLinkItem,
} from '../analytics/types'
import type { LinkListItem } from '../links/types'

export type DashboardLink = LinkListItem
export type DashboardLinkSummary = AnalyticsSummary

export type DashboardSummary = {
  totalLinks: number
  totalClicks: number
  activeLinks: number
  expiredLinks: number
  clicksLast7Days: number
}

export type DashboardRecentEvent = AnalyticsEventItem & {
  linkId: string
  shortCode: string
  title: string | null
}

export type DashboardData = {
  links: DashboardLink[]
  summary: DashboardSummary
  topLinks: TopLinkItem[]
  clicksByDay: ClicksByDayItem[]
  recentEvents: DashboardRecentEvent[]
  isPartial: boolean
}
