import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimitService } from '../src/modules/rate-limit/rate-limit.service.js'

const loginMock = vi.fn()
const registerMock = vi.fn()
const meMock = vi.fn()

vi.mock('../src/modules/auth/auth.controller.js', () => ({
  AuthController: {
    register: registerMock,
    login: loginMock,
    me: meMock,
  },
}))

vi.mock('../src/modules/rate-limit/rate-limit.service.js', () => ({
  rateLimitService: {
    consume: vi.fn(),
  },
}))

const mockedRateLimitService = vi.mocked(rateLimitService)

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRateLimitService.consume.mockResolvedValue({
      allowed: true,
      current: 1,
    })
    loginMock.mockImplementation((_req, res) => {
      res.status(200).json({
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      })
    })
  })

  it('returns 429 when login rate limit exceeded', async () => {
    const { app } = await import('../src/app.js')

    mockedRateLimitService.consume.mockResolvedValue({
      allowed: false,
      current: 11,
    })

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'secret123',
      })

    expect(response.status).toBe(429)
    expect(response.body).toMatchObject({
      statusCode: 429,
      error: 'Too Many Requests',
    })
    expect(loginMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRateLimitService.consume.mockResolvedValue({
      allowed: true,
      current: 1,
    })
    registerMock.mockImplementation((_req, res) => {
      res.status(201).json({
        id: 'user-id',
        name: 'Igor',
        email: 'test@example.com',
        createdAt: '2026-05-04T20:00:00.000Z',
      })
    })
  })

  it('returns 429 when register rate limit exceeded', async () => {
    const { app } = await import('../src/app.js')

    mockedRateLimitService.consume.mockResolvedValue({
      allowed: false,
      current: 6,
    })

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Igor',
        email: 'test@example.com',
        password: 'secret123',
      })

    expect(response.status).toBe(429)
    expect(registerMock).not.toHaveBeenCalled()
  })
})
