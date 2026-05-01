import { Redis, type RedisOptions } from 'ioredis'
import { env } from './env.js'

const redisOptions: RedisOptions = {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,

  retryStrategy(times) {
    if (times > 5) {
      return null
    }

    return Math.min(times * 200, 2000)
  },

  reconnectOnError(error) {
    const message = error.message.toLowerCase()

    if (message.includes('readonly')) {
      return true
    }

    return false
  },
}

export const redis = new Redis(env.REDIS_URL, redisOptions)

redis.on('connect', () => {
  console.log('[Redis] Connected')
})

redis.on('ready', () => {
  console.log('[Redis] Ready')
})

redis.on('error', (error) => {
  console.error('[Redis] Error:', error.message)
})

redis.on('close', () => {
  console.warn('[Redis] Connection closed')
})

redis.on('reconnecting', () => {
  console.warn('[Redis] Reconnecting...')
})

export async function connectRedis() {
  if (
    redis.status === 'ready' ||
    redis.status === 'connect' ||
    redis.status === 'connecting'
  ) {
    return
  }

  try {
    await redis.connect()
  } catch (error) {
    console.error(
      '[Redis] Failed to connect:',
      error instanceof Error ? error.message : error,
    )

    if (env.NODE_ENV === 'production') {
      throw error
    }
  }
}

export async function disconnectRedis() {
  if (redis.status === 'end') {
    return
  }

  await redis.quit()
}

export async function getRedisJson<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)

  if (!value) {
    return null
  }

  return JSON.parse(value) as T
}

export async function setRedisJson<T>(
  key: string,
  value: T,
  ttlInSeconds: number,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlInSeconds)
}

export async function deleteRedisKey(key: string): Promise<void> {
  await redis.del(key)
}

export async function deleteRedisKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return
  }

  await redis.del(...keys)
}

export function buildRedisKey(...parts: Array<string | number | null | undefined>) {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined)
    .join(':')
}
