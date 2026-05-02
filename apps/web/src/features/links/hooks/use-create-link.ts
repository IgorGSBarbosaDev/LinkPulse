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
      toast.error(error.message || 'Link could not be created. Try again.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: linksQueryKey })
      toast.success('Link created')
    },
  })
}
