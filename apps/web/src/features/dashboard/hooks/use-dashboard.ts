import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '../../../shared/api/api-error'
import { getDashboardData } from '../api/dashboard-api'
import type { DashboardData } from '../types'

export function useDashboard() {
  return useQuery<DashboardData, ApiError>({
    queryFn: getDashboardData,
    queryKey: ['dashboard'],
  })
}
