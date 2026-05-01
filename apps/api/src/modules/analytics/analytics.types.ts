import type { z } from 'zod'
import type {
  analyticsEventsQuerySchema,
  analyticsLinkIdParamsSchema,
  clicksByDayQuerySchema,
} from './analytics.schemas.js'

export type AnalyticsLinkIdParams = z.infer<
  typeof analyticsLinkIdParamsSchema
>['params']

export type ClicksByDayQuery = z.infer<typeof clicksByDayQuerySchema>['query']

export type AnalyticsEventsQuery = z.infer<
  typeof analyticsEventsQuerySchema
>['query']

export type AnalyticsSummary = {
  linkId: string
  shortCode: string
  totalClicks: number
  clicksToday: number
  clicksLast7Days: number
  lastAccessAt: Date | null
}

export type ClicksByDayItem = {
  date: string
  clicks: number
}

export type AnalyticsEventItem = {
  id: string
  accessedAt: Date
  ipAddress: string | null
  userAgent: string | null
  referer: string | null
}

export type PaginatedAnalyticsEvents = {
  data: AnalyticsEventItem[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type TopLinkItem = {
  id: string
  title: string | null
  shortCode: string
  shortUrl: string
  clickCount: number
}

