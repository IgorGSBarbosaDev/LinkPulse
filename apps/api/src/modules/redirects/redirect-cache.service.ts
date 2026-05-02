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

type RawRedirectCacheRecord = {
  id: unknown
  originalUrl: unknown
  shortCode: unknown
  active: unknown
  expiresAt: unknown
  maxClicks: unknown
  clickCount: unknown
}

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

function toDateOrNull(value: unknown): Date | null {
  if (value === null) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value !== 'string') {
    return null
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function isValidRedirectCacheRecord(
  value: unknown,
): value is RawRedirectCacheRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  if (typeof record.id !== 'string' || record.id.length === 0) {
    return false
  }

  if (
    typeof record.originalUrl !== 'string' ||
    record.originalUrl.length === 0
  ) {
    return false
  }

  if (
    typeof record.shortCode !== 'string' ||
    record.shortCode.length === 0
  ) {
    return false
  }

  if (typeof record.active !== 'boolean') {
    return false
  }

  if (record.maxClicks !== null && typeof record.maxClicks !== 'number') {
    return false
  }

  if (
    typeof record.clickCount !== 'number' ||
    Number.isNaN(record.clickCount)
  ) {
    return false
  }

  if (
    record.expiresAt !== null &&
    !(record.expiresAt instanceof Date) &&
    typeof record.expiresAt !== 'string'
  ) {
    return false
  }

  return true
}

function normalizeRedirectCacheRecord(
  rawRecord: RawRedirectCacheRecord,
): RedirectCacheRecord | null {
  const expiresAt = toDateOrNull(rawRecord.expiresAt)

  if (rawRecord.expiresAt !== null && expiresAt === null) {
    return null
  }

  return {
    id: rawRecord.id as string,
    originalUrl: rawRecord.originalUrl as string,
    shortCode: rawRecord.shortCode as string,
    active: rawRecord.active as boolean,
    expiresAt,
    maxClicks: rawRecord.maxClicks as number | null,
    clickCount: rawRecord.clickCount as number,
  }
}

class RedirectCacheService {
  async get(shortCode: string): Promise<RedirectCacheRecord | null> {
    try {
      const rawRecord = await getRedisJson<unknown>(redirectCacheKey(shortCode))

      if (!isValidRedirectCacheRecord(rawRecord)) {
        return null
      }

      return normalizeRedirectCacheRecord(rawRecord)
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
