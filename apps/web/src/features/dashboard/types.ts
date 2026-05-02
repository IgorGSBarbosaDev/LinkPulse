import type {
  AnalyticsSummary,
  ClicksByDayItem,
} from '../analytics/types'
import type { LinkListItem } from '../links/types'

export type DashboardLink = LinkListItem
export type DashboardLinkSummary = AnalyticsSummary

export type DashboardSummary = {
  totalLinks: number
  totalClicks: number
  activeLinks: number
}

export type DashboardRangePreset = '1m' | '3m' | '6m' | '1y'

export type DashboardRecentLink = {
  linkId: string
  shortCode: string
  shortUrl: string
  title: string | null
  active: boolean
  clickCount: number
  lastAccessAt: string
}

export type DashboardData = {
  links: DashboardLink[]
  summary: DashboardSummary
  clicksByDay: ClicksByDayItem[]
  recentLinks: DashboardRecentLink[]
  isPartial: boolean
}
