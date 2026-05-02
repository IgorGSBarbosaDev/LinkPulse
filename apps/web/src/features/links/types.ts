export type LinkSortField = 'createdAt' | 'clickCount' | 'title'
export type SortOrder = 'asc' | 'desc'
export type LinkStatusFilter = 'all' | 'active' | 'inactive'

export type LinkListItem = {
  id: string
  title: string | null
  originalUrl: string
  shortCode: string
  customAlias?: string | null
  shortUrl: string
  active: boolean
  expired: boolean
  reachedMaxClicks?: boolean
  clickCount: number
  expiresAt: string | null
  createdAt: string
  updatedAt?: string
}

export type LinksPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type ListLinksResponse = {
  data: LinkListItem[]
  pagination: LinksPagination
}

export type LinksFilters = {
  page: number
  limit: number
  search: string
  active: LinkStatusFilter
  sort: LinkSortField
  order: SortOrder
}

export type ListLinksParams = {
  page: number
  limit: number
  search?: string
  active?: boolean
  sort: LinkSortField
  order: SortOrder
}
