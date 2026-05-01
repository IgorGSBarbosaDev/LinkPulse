import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimitService } from '../src/modules/rate-limit/rate-limit.service.js'
import { redis } from '../src/shared/config/redis.js'

vi.mock('../src/shared/config/redis.js', () => ({
  buildRedisKey: (...parts: Array<string | number>) => parts.join(':'),
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}))

const mockedRedis = vi.mocked(redis)

describe('rateLimitService.consume', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows first request and sets expire', async () => {
    mockedRedis.incr.mockResolvedValue(1)
    mockedRedis.expire.mockResolvedValue(1)

    const result = await rateLimitService.consume(['rate:login', '127.0.0.1'], 10, 60)

    expect(result).toEqual({
      allowed: true,
      current: 1,
    })
    expect(mockedRedis.expire).toHaveBeenCalledWith('rate:login:127.0.0.1', 60)
  })

  it('blocks when count exceeds limit', async () => {
    mockedRedis.incr.mockResolvedValue(11)

    const result = await rateLimitService.consume(['rate:login', '127.0.0.1'], 10, 60)

    expect(result).toEqual({
      allowed: false,
      current: 11,
    })
    expect(mockedRedis.expire).not.toHaveBeenCalled()
  })
})
