import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../src/shared/errors/app-error.js'

const resolveRedirectMock = vi.fn()

vi.mock('../src/modules/redirects/redirects.service.js', () => ({
  redirectsService: {
    resolveRedirect: resolveRedirectMock,
  },
}))

describe('GET /r/:shortCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects valid link with 302 and location header', async () => {
    const { app } = await import('../src/app.js')

    resolveRedirectMock.mockResolvedValue({
      originalUrl: 'https://example.com/landing',
    })

    const response = await request(app)
      .get('/r/abc123')
      .set('User-Agent', 'supertest-agent')
      .set('Referer', 'https://referrer.test')
      .redirects(0)

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe('https://example.com/landing')
    expect(resolveRedirectMock).toHaveBeenCalledWith({
      shortCode: 'abc123',
      metadata: {
        ipAddress: expect.any(String),
        userAgent: 'supertest-agent',
        referer: 'https://referrer.test',
      },
    })
  })

  it('returns 404 for unknown short code', async () => {
    const { app } = await import('../src/app.js')

    resolveRedirectMock.mockRejectedValue(
      AppError.notFound('Link not found.'),
    )

    const response = await request(app)
      .get('/r/missing')
      .redirects(0)

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'Link not found.',
    })
  })

  it('returns 410 for unavailable link', async () => {
    const { app } = await import('../src/app.js')

    resolveRedirectMock.mockRejectedValue(
      AppError.gone('Link is inactive.'),
    )

    const response = await request(app)
      .get('/r/inactive')
      .redirects(0)

    expect(response.status).toBe(410)
    expect(response.body).toMatchObject({
      statusCode: 410,
      error: 'Gone',
      message: 'Link is inactive.',
    })
  })
})
