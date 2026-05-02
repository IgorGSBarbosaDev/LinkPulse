import { apiClient } from '../../../shared/api/client'
import type { LinkListItem, ListLinksParams, ListLinksResponse } from '../types'

export async function listLinks(params: ListLinksParams) {
  const response = await apiClient.get<ListLinksResponse>('/api/v1/links', {
    params,
  })

  return response.data
}

export async function activateLink(linkId: string) {
  const response = await apiClient.patch<LinkListItem>(
    `/api/v1/links/${linkId}/activate`,
  )

  return response.data
}

export async function deactivateLink(linkId: string) {
  const response = await apiClient.patch<LinkListItem>(
    `/api/v1/links/${linkId}/deactivate`,
  )

  return response.data
}

export async function deleteLink(linkId: string) {
  await apiClient.delete(`/api/v1/links/${linkId}`)
}
