import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '../../../shared/api/api-error'
import { listLinks } from '../api/links-api'
import type { LinksFilters, ListLinksResponse } from '../types'
import { toListLinksParams } from '../utils/link-filters'

export function getLinksQueryKey(filters: LinksFilters) {
  return ['links', toListLinksParams(filters)] as const
}

export function useLinks(filters: LinksFilters) {
  return useQuery<ListLinksResponse, ApiError>({
    queryFn: () => listLinks(toListLinksParams(filters)),
    queryKey: getLinksQueryKey(filters),
    placeholderData: (previousData) => previousData,
  })
}
