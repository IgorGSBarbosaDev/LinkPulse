import { apiClient } from '../../../shared/api/client'
import type {
  CreateLinkRequest,
  LinkDetails,
  LinkListItem,
  ListLinksParams,
  ListLinksResponse,
  UpdateLinkVariables,
} from '../types'

export async function listLinks(params: ListLinksParams) {
  const response = await apiClient.get<ListLinksResponse>('/api/v1/links', {
    params,
  })

  return response.data
}

export async function createLink(payload: CreateLinkRequest) {
  const response = await apiClient.post<LinkDetails>('/api/v1/links', payload)

  return response.data
}

export async function getLink(linkId: string) {
  const response = await apiClient.get<LinkDetails>(`/api/v1/links/${linkId}`)

  return response.data
}

export async function updateLink({ linkId, payload }: UpdateLinkVariables) {
  const response = await apiClient.patch<LinkDetails>(
    `/api/v1/links/${linkId}`,
    payload,
  )

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
