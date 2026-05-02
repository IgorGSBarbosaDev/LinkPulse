import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { activateLink, deactivateLink, deleteLink } from '../api/links-api'

const linksQueryKey = ['links'] as const

function getErrorMessage(error: ApiError) {
  return error.message || 'Action failed. Try again.'
}

export function useActivateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: activateLink,
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: linksQueryKey })
      toast.success('Link activated')
    },
  })
}

export function useDeactivateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateLink,
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: linksQueryKey })
      toast.success('Link deactivated')
    },
  })
}

export function useDeleteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLink,
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: linksQueryKey })
      toast.success('Link deleted')
    },
  })
}
