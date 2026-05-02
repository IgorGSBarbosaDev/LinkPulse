import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '../../../shared/api/api-error'
import { getDashboardData } from '../api/dashboard-api'
import type { DashboardData, DashboardRangePreset } from '../types'

export function useDashboard(range: DashboardRangePreset) {
  return useQuery<DashboardData, ApiError>({
    queryFn: () => getDashboardData(range),
    queryKey: ['dashboard', range],
  })
}
