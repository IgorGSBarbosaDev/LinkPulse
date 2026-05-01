import { env } from '../../shared/config/env.js'
import {
  deleteRedisKeys,
  getRedisJson,
  setRedisJson,
} from '../../shared/config/redis.js'
import type { RedirectLinkRecord } from './redirects.types.js'

type RedirectCacheRecord = Pick<
  RedirectLinkRecord,
  'id' | 'originalUrl' | 'shortCode' | 'active' | 'expiresAt' | 'maxClicks' | 'clickCount'
>

function redirectCacheKey(shortCode: string): string {
  return `link:redirect:${shortCode}`
}

function resolveTtlInSeconds(expiresAt: Date | null): number {
  if (!expiresAt) {
    return env.REDIRECT_CACHE_TTL_SECONDS
  }

  const remainingMilliseconds = expiresAt.getTime() - Date.now()
  return Math.floor(remainingMilliseconds / 1000)
}

class RedirectCacheService {
  async get(shortCode: string): Promise<RedirectCacheRecord | null> {
    try {
      return await getRedisJson<RedirectCacheRecord>(redirectCacheKey(shortCode))
    } catch {
      return null
    }
  }

  async set(link: RedirectCacheRecord): Promise<void> {
    const ttlInSeconds = resolveTtlInSeconds(link.expiresAt)

    if (ttlInSeconds <= 0) {
      return
    }

    try {
      await setRedisJson(redirectCacheKey(link.shortCode), link, ttlInSeconds)
    } catch {
      // Redis failure should not block redirect flow.
    }
  }

  async invalidateMany(shortCodes: Array<string | null | undefined>): Promise<void> {
    const uniqueShortCodes = Array.from(
      new Set(shortCodes.filter(Boolean)),
    ) as string[]

    if (uniqueShortCodes.length === 0) {
      return
    }

    try {
      await deleteRedisKeys(uniqueShortCodes.map(redirectCacheKey))
    } catch {
      // Redis failure should not block PostgreSQL operations.
    }
  }
}

export const redirectCacheService = new RedirectCacheService()
