import { describe, expect, it } from 'vitest'

import { buildDashboardSummary, mergeClicksByDay } from './dashboard-metrics'
import type { DashboardLink, DashboardLinkSummary } from '../types'

const links: DashboardLink[] = [
  {
    id: 'link-1',
    title: 'Backend',
    originalUrl: 'https://example.com/backend',
    shortCode: 'backend',
    shortUrl: 'http://localhost:3000/r/backend',
    active: true,
    expired: false,
    clickCount: 12,
    expiresAt: null,
    createdAt: '2026-04-20T12:00:00.000Z',
  },
  {
    id: 'link-2',
    title: null,
    originalUrl: 'https://example.com/old',
    shortCode: 'old',
    shortUrl: 'http://localhost:3000/r/old',
    active: false,
    expired: true,
    clickCount: 8,
    expiresAt: '2026-04-01T00:00:00.000Z',
    createdAt: '2026-04-19T12:00:00.000Z',
  },
]

const summaries: DashboardLinkSummary[] = [
  {
    linkId: 'link-1',
    shortCode: 'backend',
    totalClicks: 12,
    clicksToday: 2,
    clicksLast7Days: 5,
    lastAccessAt: '2026-04-23T10:00:00.000Z',
  },
  {
    linkId: 'link-2',
    shortCode: 'old',
    totalClicks: 8,
    clicksToday: 1,
    clicksLast7Days: 3,
    lastAccessAt: null,
  },
]

describe('dashboard metrics', () => {
  it('builds summary from real links and summaries', () => {
    expect(buildDashboardSummary(links, summaries)).toEqual({
      totalLinks: 2,
      totalClicks: 20,
      activeLinks: 1,
      expiredLinks: 1,
      clicksLast7Days: 8,
    })
  })

  it('merges clicks-by-day from multiple links', () => {
    expect(
      mergeClicksByDay([
        [
          { date: '2026-04-21', clicks: 2 },
          { date: '2026-04-22', clicks: 3 },
        ],
        [
          { date: '2026-04-21', clicks: 4 },
          { date: '2026-04-23', clicks: 1 },
        ],
      ]),
    ).toEqual([
      { date: '2026-04-21', clicks: 6 },
      { date: '2026-04-22', clicks: 3 },
      { date: '2026-04-23', clicks: 1 },
    ])
  })
})
