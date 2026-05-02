import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '../../../shared/api/api-error'
import {
  getLinkAnalyticsEvents,
  getLinkAnalyticsSummary,
  getLinkClicksByDay,
} from '../api/analytics-api'
import type {
  AnalyticsEventsParams,
  AnalyticsEventsResponse,
  AnalyticsSummary,
  ClicksByDayItem,
  ClicksByDayParams,
} from '../types'

export function useLinkAnalyticsSummary(linkId: string | undefined) {
  return useQuery<AnalyticsSummary, ApiError>({
    enabled: Boolean(linkId),
    queryFn: () => getLinkAnalyticsSummary(linkId as string),
    queryKey: ['analytics', 'summary', linkId],
  })
}

export function useLinkClicksByDay(
  linkId: string | undefined,
  params: ClicksByDayParams,
) {
  return useQuery<ClicksByDayItem[], ApiError>({
    enabled: Boolean(linkId),
    queryFn: () => getLinkClicksByDay(linkId as string, params),
    queryKey: ['analytics', 'clicks-by-day', linkId, params],
  })
}

export function useLinkAnalyticsEvents(
  linkId: string | undefined,
  params: AnalyticsEventsParams,
) {
  return useQuery<AnalyticsEventsResponse, ApiError>({
    enabled: Boolean(linkId),
    placeholderData: (previousData) => previousData,
    queryFn: () => getLinkAnalyticsEvents(linkId as string, params),
    queryKey: ['analytics', 'events', linkId, params],
  })
}
