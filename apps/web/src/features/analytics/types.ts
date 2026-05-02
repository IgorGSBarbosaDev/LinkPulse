export type AnalyticsSummary = {
  linkId: string
  shortCode: string
  totalClicks: number
  clicksToday: number
  clicksLast7Days: number
  lastAccessAt: string | null
}

export type ClicksByDayItem = {
  date: string
  clicks: number
}

export type AnalyticsEventItem = {
  id: string
  accessedAt: string
  ipAddress: string | null
  userAgent: string | null
  referer: string | null
}

export type AnalyticsEventsPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type AnalyticsEventsResponse = {
  data: AnalyticsEventItem[]
  pagination: AnalyticsEventsPagination
}

export type AnalyticsEventsParams = {
  page: number
  limit: number
}

export type ClicksByDayParams = {
  from?: string
  to?: string
}

export type TopLinkItem = {
  id: string
  title: string | null
  shortCode: string
  shortUrl: string
  clickCount: number
}
