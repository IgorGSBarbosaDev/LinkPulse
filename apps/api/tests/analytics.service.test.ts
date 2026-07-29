import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../src/shared/errors/app-error.js'
import { analyticsRepository } from '../src/modules/analytics/analytics.repository.js'
import { analyticsService } from '../src/modules/analytics/analytics.service.js'

vi.mock('../src/modules/analytics/analytics.repository.js', () => ({
  analyticsRepository: {
    findOwnedLinkOrNull: vi.fn(),
    countEventsInRange: vi.fn(),
    findLastAccessAt: vi.fn(),
    findClicksByDay: vi.fn(),
    listEvents: vi.fn(),
    listTopLinks: vi.fn(),
    getDashboardData: vi.fn(),
  },
}))

const mockedRepository = vi.mocked(analyticsRepository)

const ownedLink = {
  id: '9e9ace71-bbe8-44fd-9936-56c6f5b21534',
  shortCode: 'abc123',
  clickCount: 25,
}

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns analytics summary for owned link', async () => {
    mockedRepository.findOwnedLinkOrNull.mockResolvedValue(ownedLink)
    mockedRepository.countEventsInRange
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(18)
    mockedRepository.findLastAccessAt.mockResolvedValue(
      new Date('2026-04-30T16:00:00.000Z'),
    )

    const result = await analyticsService.getSummary(
      '94a2ef3f-18d2-4488-9aef-aea4de65fc72',
      ownedLink.id,
    )

    expect(result).toEqual({
      linkId: ownedLink.id,
      shortCode: ownedLink.shortCode,
      totalClicks: 25,
      clicksToday: 3,
      clicksLast7Days: 18,
      lastAccessAt: new Date('2026-04-30T16:00:00.000Z'),
    })
  })

  it('blocks summary for foreign link', async () => {
    mockedRepository.findOwnedLinkOrNull.mockResolvedValue(null)

    await expect(
      analyticsService.getSummary(
        'eb95c90e-2504-4db6-86e7-39a391f58c5b',
        '68fd3ec3-fef7-417b-b67a-ca572258fdd9',
      ),
    ).rejects.toMatchObject<AppError>({
      statusCode: 404,
      error: 'Not Found',
    })
  })

  it('returns clicks grouped by day', async () => {
    mockedRepository.findOwnedLinkOrNull.mockResolvedValue(ownedLink)
    mockedRepository.findClicksByDay.mockResolvedValue([
      { date: '2026-04-21', clicks: 4 },
      { date: '2026-04-22', clicks: 7 },
    ])

    const result = await analyticsService.getClicksByDay(
      'user-1',
      ownedLink.id,
      { from: '2026-04-21', to: '2026-04-22' },
    )

    expect(result).toEqual([
      { date: '2026-04-21', clicks: 4 },
      { date: '2026-04-22', clicks: 7 },
    ])
  })

  it('uses default range for clicks-by-day when query empty', async () => {
    mockedRepository.findOwnedLinkOrNull.mockResolvedValue(ownedLink)
    mockedRepository.findClicksByDay.mockResolvedValue([])

    await analyticsService.getClicksByDay('user-1', ownedLink.id, {})

    expect(mockedRepository.findClicksByDay).toHaveBeenCalledTimes(1)
    expect(mockedRepository.findClicksByDay.mock.calls[0]?.[1]).toBeInstanceOf(
      Date,
    )
    expect(mockedRepository.findClicksByDay.mock.calls[0]?.[2]).toBeInstanceOf(
      Date,
    )
  })

  it('returns paginated events', async () => {
    mockedRepository.findOwnedLinkOrNull.mockResolvedValue(ownedLink)
    mockedRepository.listEvents.mockResolvedValue({
      events: [
        {
          id: 'ev-1',
          accessedAt: new Date('2026-04-30T10:00:00.000Z'),
          ipAddress: '127.0.0.1',
          userAgent: 'Vitest',
          referer: 'https://example.com',
        },
      ],
      totalItems: 14,
    })

    const result = await analyticsService.getEvents('user-1', ownedLink.id, {
      page: 2,
      limit: 10,
    })

    expect(result.data).toHaveLength(1)
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      totalItems: 14,
      totalPages: 2,
    })
  })

  it('returns top links only for current user', async () => {
    mockedRepository.listTopLinks.mockResolvedValue([
      {
        id: '1',
        title: 'A',
        shortCode: 'a1',
        clickCount: 10,
      },
      {
        id: '2',
        title: null,
        shortCode: 'b2',
        clickCount: 8,
      },
    ])

    const result = await analyticsService.getTopLinks('user-1')

    expect(result).toEqual([
      {
        id: '1',
        title: 'A',
        shortCode: 'a1',
        shortUrl: 'http://localhost:3000/r/a1',
        clickCount: 10,
      },
      {
        id: '2',
        title: null,
        shortCode: 'b2',
        shortUrl: 'http://localhost:3000/r/b2',
        clickCount: 8,
      },
    ])
  })

  it('builds dashboard metrics from one aggregated repository result', async () => {
    const today = new Date().toISOString().slice(0, 10)

    mockedRepository.getDashboardData.mockResolvedValue({
      links: [
        {
          ...ownedLink,
          userId: 'user-1',
          originalUrl: 'https://example.com/a',
          customAlias: null,
          title: 'A',
          description: null,
          active: true,
          expiresAt: null,
          maxClicks: null,
          deletedAt: null,
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z'),
        },
      ],
      clicksByDay: [{ date: today, clicks: 2 }],
      recentEvents: [],
    })

    const result = await analyticsService.getDashboard('user-1', { range: '3m' })

    expect(result.summary).toMatchObject({
      totalLinks: 1,
      totalClicks: 25,
      activeLinks: 1,
      clicksToday: 2,
      clicksLast7Days: 2,
    })
    expect(result.topLinks).toEqual([
      {
        id: ownedLink.id,
        title: 'A',
        shortCode: ownedLink.shortCode,
        shortUrl: 'http://localhost:3000/r/abc123',
        clickCount: 25,
      },
    ])
    expect(mockedRepository.getDashboardData).toHaveBeenCalledTimes(1)
  })
})

