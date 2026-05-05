import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimitService } from '../src/modules/rate-limit/rate-limit.service.js'

const loginMock = vi.fn()
const registerMock = vi.fn()
const meMock = vi.fn()
const verifyEmailMock = vi.fn()
const resendVerificationEmailMock = vi.fn()

vi.mock('../src/modules/auth/auth.controller.js', () => ({
  AuthController: {
    register: registerMock,
    login: loginMock,
    me: meMock,
    verifyEmail: verifyEmailMock,
    resendVerificationEmail: resendVerificationEmailMock,
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
        message: 'Account created. Please verify your email before logging in.',
        emailVerificationRequired: true,
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

describe('POST /api/v1/auth/resend-verification-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRateLimitService.consume.mockResolvedValue({
      allowed: true,
      current: 1,
    })
    resendVerificationEmailMock.mockImplementation((_req, res) => {
      res.status(200).json({
        message:
          'If this email is registered and not verified, a new verification link will be sent.',
      })
    })
  })

  it('uses IP and normalized email rate-limit keys before resending', async () => {
    const { app } = await import('../src/app.js')

    const response = await request(app)
      .post('/api/v1/auth/resend-verification-email')
      .send({
        email: ' TEST@Example.COM ',
      })

    expect(response.status).toBe(200)
    expect(mockedRateLimitService.consume).toHaveBeenNthCalledWith(
      1,
      ['rate:email-verification:resend:ip', expect.any(String)],
      expect.any(Number),
      expect.any(Number),
    )
    expect(mockedRateLimitService.consume).toHaveBeenNthCalledWith(
      2,
      ['rate:email-verification:resend:email', 'test@example.com'],
      expect.any(Number),
      expect.any(Number),
    )
  })
})
