import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimitService } from '../src/modules/rate-limit/rate-limit.service.js'

const createMock = vi.fn()
const listMock = vi.fn()
const findByIdMock = vi.fn()
const updateMock = vi.fn()
const deleteMock = vi.fn()
const activateMock = vi.fn()
const deactivateMock = vi.fn()

vi.mock('../src/modules/links/links.controller.js', () => ({
  linksController: {
    create: createMock,
    list: listMock,
    findById: findByIdMock,
    update: updateMock,
    delete: deleteMock,
    activate: activateMock,
    deactivate: deactivateMock,
  },
}))

vi.mock('../src/modules/rate-limit/rate-limit.service.js', () => ({
  rateLimitService: {
    consume: vi.fn(),
  },
}))

const mockedRateLimitService = vi.mocked(rateLimitService)

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

describe('POST /api/v1/links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-jwt-secret-12345'
    mockedRateLimitService.consume.mockResolvedValue({
      allowed: true,
      current: 1,
    })
    createMock.mockImplementation((_req, res) => {
      res.status(201).json({
        id: 'link-id',
      })
    })
  })

  it('returns 429 when create-link rate limit exceeded', async () => {
    const { app } = await import('../src/app.js')
    const token = buildToken()

    mockedRateLimitService.consume.mockResolvedValue({
      allowed: false,
      current: 21,
    })

    const response = await request(app)
      .post('/api/v1/links')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalUrl: 'https://example.com',
      })

    expect(response.status).toBe(429)
    expect(response.body).toMatchObject({
      statusCode: 429,
      error: 'Too Many Requests',
      code: 'RATE_LIMITED',
    })
    expect(createMock).not.toHaveBeenCalled()
  })

})
