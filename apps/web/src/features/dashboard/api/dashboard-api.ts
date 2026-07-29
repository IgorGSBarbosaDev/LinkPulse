import { apiClient } from '../../../shared/api/client'
import type { DashboardData, DashboardRangePreset } from '../types'

export async function getDashboardData(
  range: DashboardRangePreset,
): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>(
    '/api/v1/analytics/dashboard',
    { params: { range } },
  )

  return response.data
}
