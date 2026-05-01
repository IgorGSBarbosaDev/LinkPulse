import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../src/shared/errors/app-error.js'
import {
  byIpRateLimit,
  createRateLimitMiddleware,
} from '../src/shared/middlewares/rate-limit.middleware.js'
import { rateLimitService } from '../src/modules/rate-limit/rate-limit.service.js'

vi.mock('../src/modules/rate-limit/rate-limit.service.js', () => ({
  rateLimitService: {
    consume: vi.fn(),
  },
}))

const mockedRateLimitService = vi.mocked(rateLimitService)

function createReq(ip = '127.0.0.1'): Request {
  return { ip } as Request
}

function createRes(): Response {
  return {} as Response
}

describe('rate-limit middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls next when allowed', async () => {
    mockedRateLimitService.consume.mockResolvedValue({
      allowed: true,
      current: 1,
    })
    const middleware = byIpRateLimit({
      keyPrefix: 'rate:redirect',
      max: 100,
      windowInSeconds: 60,
    })
    const next = vi.fn() as NextFunction

    await middleware(createReq(), createRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('returns AppError too many requests when blocked', async () => {
    mockedRateLimitService.consume.mockResolvedValue({
      allowed: false,
      current: 101,
    })
    const middleware = byIpRateLimit({
      keyPrefix: 'rate:redirect',
      max: 100,
      windowInSeconds: 60,
    })
    const next = vi.fn() as NextFunction

    await middleware(createReq(), createRes(), next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AppError)
    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(429)
  })

  it('fails open on redis/service errors', async () => {
    mockedRateLimitService.consume.mockRejectedValue(new Error('redis down'))
    const middleware = createRateLimitMiddleware({
      keyPrefix: 'rate:login',
      max: 10,
      windowInSeconds: 60,
      getIdentifier: () => '127.0.0.1',
    })
    const next = vi.fn() as NextFunction

    await middleware(createReq(), createRes(), next)

    expect(next).toHaveBeenCalledWith()
  })
})
