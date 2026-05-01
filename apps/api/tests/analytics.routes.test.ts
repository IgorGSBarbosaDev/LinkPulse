import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../src/shared/errors/app-error.js'

const getSummaryMock = vi.fn()
const getClicksByDayMock = vi.fn()
const getEventsMock = vi.fn()
const getTopLinksMock = vi.fn()

vi.mock('../src/modules/analytics/analytics.service.js', () => ({
  analyticsService: {
    getSummary: getSummaryMock,
    getClicksByDay: getClicksByDayMock,
    getEvents: getEventsMock,
    getTopLinks: getTopLinksMock,
  },
}))

function buildToken(): string {
  return jwt.sign(
    {
      sub: 'f7ad2caa-87e7-4fd9-8ff8-ef18c43445f1',
      email: 'test@example.com',
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' },
  )
}

describe('analytics routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-jwt-secret-12345'
  })

  it('requires authentication', async () => {
    const { app } = await import('../src/app.js')

    const response = await request(app).get(
      '/api/v1/analytics/top-links',
    )

    expect(response.status).toBe(401)
  })

  it('returns summary for authenticated user', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    getSummaryMock.mockResolvedValue({
      linkId: '2f8f6357-a29d-4060-8cee-f7bd31149fc4',
      shortCode: 'abc123',
      totalClicks: 20,
      clicksToday: 2,
      clicksLast7Days: 10,
      lastAccessAt: '2026-04-30T12:00:00.000Z',
    })

    const response = await request(app)
      .get('/api/v1/links/2f8f6357-a29d-4060-8cee-f7bd31149fc4/analytics/summary')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      shortCode: 'abc123',
      totalClicks: 20,
    })
    expect(getSummaryMock).toHaveBeenCalledTimes(1)
  })

  it('returns 404 for non-owned link', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    getSummaryMock.mockRejectedValue(AppError.notFound('Link not found.'))

    const response = await request(app)
      .get('/api/v1/links/2f8f6357-a29d-4060-8cee-f7bd31149fc4/analytics/summary')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      error: 'Not Found',
      message: 'Link not found.',
    })
  })

  it('returns grouped clicks-by-day', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    getClicksByDayMock.mockResolvedValue([
      { date: '2026-04-21', clicks: 2 },
      { date: '2026-04-22', clicks: 4 },
    ])

    const response = await request(app)
      .get('/api/v1/links/2f8f6357-a29d-4060-8cee-f7bd31149fc4/analytics/clicks-by-day?from=2026-04-21&to=2026-04-22')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      { date: '2026-04-21', clicks: 2 },
      { date: '2026-04-22', clicks: 4 },
    ])
  })

  it('validates events pagination query params', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    const response = await request(app)
      .get('/api/v1/links/2f8f6357-a29d-4060-8cee-f7bd31149fc4/analytics/events?page=0&limit=1000')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })

  it('returns paginated events', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    getEventsMock.mockResolvedValue({
      data: [
        {
          id: 'ev-1',
          accessedAt: '2026-04-30T10:00:00.000Z',
          ipAddress: '127.0.0.1',
          userAgent: 'Vitest',
          referer: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    })

    const response = await request(app)
      .get('/api/v1/links/2f8f6357-a29d-4060-8cee-f7bd31149fc4/analytics/events?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
    })
  })

  it('returns top links for authenticated user', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    getTopLinksMock.mockResolvedValue([
      {
        id: '1',
        title: 'A',
        shortCode: 'a1',
        shortUrl: 'http://localhost:3000/r/a1',
        clickCount: 12,
      },
    ])

    const response = await request(app)
      .get('/api/v1/analytics/top-links')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      {
        id: '1',
        title: 'A',
        shortCode: 'a1',
        shortUrl: 'http://localhost:3000/r/a1',
        clickCount: 12,
      },
    ])
  })
})

