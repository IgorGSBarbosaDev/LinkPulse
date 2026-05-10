import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { createLink } from '../api/links-api'

const linksQueryKey = ['links'] as const

export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLink,
    onError: (error: ApiError) => {
      if (error.code === 'LINK_LIMIT_REACHED') {
        toast.error('You have reached the maximum limit of 15 links.')
        return
      }

      toast.error(error.message || 'Link could not be created. Try again.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: linksQueryKey })
      toast.success('Link created')
    },
  })
}
