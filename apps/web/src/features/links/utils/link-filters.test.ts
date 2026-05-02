import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LINKS_FILTERS,
  buildLinksSearchParams,
  parseLinksSearchParams,
} from './link-filters'

describe('link filter helpers', () => {
  it('parses defaults from empty search params', () => {
    const filters = parseLinksSearchParams(new URLSearchParams())

    expect(filters).toEqual(DEFAULT_LINKS_FILTERS)
  })

  it('resets invalid page and active values to safe defaults', () => {
    const filters = parseLinksSearchParams(
      new URLSearchParams('page=0&active=archived&sort=bad&order=up'),
    )

    expect(filters.page).toBe(1)
    expect(filters.active).toBe('all')
    expect(filters.sort).toBe('createdAt')
    expect(filters.order).toBe('desc')
  })

  it('omits all status and empty search when building API params', () => {
    const params = buildLinksSearchParams({
      ...DEFAULT_LINKS_FILTERS,
      search: '   ',
      active: 'all',
    })

    expect(params.toString()).toBe('page=1&limit=10&sort=createdAt&order=desc')
  })

  it('parses boolean active search params from API-shaped URLs', () => {
    const activeFilters = parseLinksSearchParams(new URLSearchParams('active=true'))
    const inactiveFilters = parseLinksSearchParams(new URLSearchParams('active=false'))

    expect(activeFilters.active).toBe('active')
    expect(inactiveFilters.active).toBe('inactive')
  })
})
