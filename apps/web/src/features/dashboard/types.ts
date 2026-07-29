import type { ClicksByDayItem, TopLinkItem } from '../analytics/types'

export type DashboardSummary = {
  totalLinks: number
  totalClicks: number
  activeLinks: number
  clicksToday: number
  clicksLast7Days: number
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
  summary: DashboardSummary
  clicksByDay: ClicksByDayItem[]
  topLinks: TopLinkItem[]
  recentLinks: DashboardRecentLink[]
}
