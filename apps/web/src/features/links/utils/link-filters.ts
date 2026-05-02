import type {
  LinkSortField,
  LinkStatusFilter,
  LinksFilters,
  ListLinksParams,
  SortOrder,
} from '../types'

export const DEFAULT_LINKS_FILTERS: LinksFilters = {
  page: 1,
  limit: 10,
  search: '',
  active: 'all',
  sort: 'createdAt',
  order: 'desc',
}

const validStatuses = new Set<LinkStatusFilter>(['all', 'active', 'inactive'])
const validSorts = new Set<LinkSortField>(['createdAt', 'clickCount', 'title'])
const validOrders = new Set<SortOrder>(['asc', 'desc'])

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

export function parseLinksSearchParams(params: URLSearchParams): LinksFilters {
  const rawActive = params.get('active')
  const sort = params.get('sort') as LinkSortField | null
  const order = params.get('order') as SortOrder | null
  const active =
    rawActive === 'true'
      ? 'active'
      : rawActive === 'false'
        ? 'inactive'
        : (rawActive as LinkStatusFilter | null)

  return {
    page: parsePositiveInteger(params.get('page'), DEFAULT_LINKS_FILTERS.page),
    limit: parsePositiveInteger(params.get('limit'), DEFAULT_LINKS_FILTERS.limit),
    search: params.get('search') ?? DEFAULT_LINKS_FILTERS.search,
    active:
      active && validStatuses.has(active) ? active : DEFAULT_LINKS_FILTERS.active,
    sort: sort && validSorts.has(sort) ? sort : DEFAULT_LINKS_FILTERS.sort,
    order: order && validOrders.has(order) ? order : DEFAULT_LINKS_FILTERS.order,
  }
}

export function toListLinksParams(filters: LinksFilters): ListLinksParams {
  const search = filters.search.trim()

  return {
    page: filters.page,
    limit: filters.limit,
    ...(search ? { search } : {}),
    ...(filters.active === 'active' ? { active: true } : {}),
    ...(filters.active === 'inactive' ? { active: false } : {}),
    sort: filters.sort,
    order: filters.order,
  }
}

export function buildLinksSearchParams(filters: LinksFilters) {
  const apiParams = toListLinksParams(filters)
  const params = new URLSearchParams()

  params.set('page', String(apiParams.page))
  params.set('limit', String(apiParams.limit))

  if (apiParams.search) {
    params.set('search', apiParams.search)
  }

  if (typeof apiParams.active === 'boolean') {
    params.set('active', String(apiParams.active))
  }

  params.set('sort', apiParams.sort)
  params.set('order', apiParams.order)

  return params
}

export function patchLinksFilters(
  current: LinksFilters,
  patch: Partial<LinksFilters>,
): LinksFilters {
  return {
    ...current,
    ...patch,
  }
}
