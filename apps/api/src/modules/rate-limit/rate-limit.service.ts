import { buildRedisKey, redis } from '../../shared/config/redis.js'

export type RateLimitResult = {
  allowed: boolean
  current: number
}

class RateLimitService {
  async consume(
    keyParts: Array<string | number>,
    max: number,
    windowInSeconds: number,
  ): Promise<RateLimitResult> {
    const key = buildRedisKey(...keyParts)
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, windowInSeconds)
    }

    return {
      allowed: current <= max,
      current,
    }
  }
}

export const rateLimitService = new RateLimitService()
