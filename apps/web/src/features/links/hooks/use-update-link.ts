import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { updateLink } from '../api/links-api'
import { getLinkQueryKey } from './use-link'

const linksQueryKey = ['links'] as const

export function useUpdateLink(linkId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateLink,
    onError: (error: ApiError) => {
      toast.error(error.message || 'Link could not be updated. Try again.')
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: linksQueryKey }),
        queryClient.invalidateQueries({ queryKey: getLinkQueryKey(linkId) }),
      ])
      toast.success('Link updated')
    },
  })
}
