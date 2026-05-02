import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '../../../shared/api/api-error'
import { getLink } from '../api/links-api'
import type { LinkDetails } from '../types'

export function getLinkQueryKey(linkId: string) {
  return ['links', 'detail', linkId] as const
}

export function useLink(linkId: string | undefined) {
  return useQuery<LinkDetails, ApiError>({
    enabled: Boolean(linkId),
    queryFn: () => getLink(linkId as string),
    queryKey: getLinkQueryKey(linkId ?? ''),
  })
}
