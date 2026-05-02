import { apiClient } from '../../../shared/api/client'
import type {
  AnalyticsEventsParams,
  AnalyticsEventsResponse,
  AnalyticsSummary,
  ClicksByDayItem,
  ClicksByDayParams,
  TopLinkItem,
} from '../types'

export async function getLinkAnalyticsSummary(linkId: string) {
  const response = await apiClient.get<AnalyticsSummary>(
    `/api/v1/links/${linkId}/analytics/summary`,
  )

  return response.data
}

export async function getLinkClicksByDay(
  linkId: string,
  params: ClicksByDayParams = {},
) {
  const response = await apiClient.get<ClicksByDayItem[]>(
    `/api/v1/links/${linkId}/analytics/clicks-by-day`,
    { params },
  )

  return response.data
}

export async function getLinkAnalyticsEvents(
  linkId: string,
  params: AnalyticsEventsParams,
) {
  const response = await apiClient.get<AnalyticsEventsResponse>(
    `/api/v1/links/${linkId}/analytics/events`,
    { params },
  )

  return response.data
}

export async function getTopLinks() {
  const response = await apiClient.get<TopLinkItem[]>(
    '/api/v1/analytics/top-links',
  )

  return response.data
}
