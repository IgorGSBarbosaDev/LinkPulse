import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redirectCacheService } from '../src/modules/redirects/redirect-cache.service.js'
import {
  deleteRedisKeys,
  getRedisJson,
  setRedisJson,
} from '../src/shared/config/redis.js'

vi.mock('../src/shared/config/redis.js', () => ({
  getRedisJson: vi.fn(),
  setRedisJson: vi.fn(),
  deleteRedisKeys: vi.fn(),
}))

const mockedGetRedisJson = vi.mocked(getRedisJson)
const mockedSetRedisJson = vi.mocked(setRedisJson)
const mockedDeleteRedisKeys = vi.mocked(deleteRedisKeys)

describe('redirectCacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns cached redirect data on hit', async () => {
    mockedGetRedisJson.mockResolvedValue({
      id: 'id-1',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      active: true,
      expiresAt: null,
      maxClicks: null,
      clickCount: 1,
    })

    const result = await redirectCacheService.get('abc123')

    expect(result).toMatchObject({
      shortCode: 'abc123',
    })
    expect(mockedGetRedisJson).toHaveBeenCalledWith('link:redirect:abc123')
  })

  it('uses default ttl when expiresAt absent', async () => {
    await redirectCacheService.set({
      id: 'id-1',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      active: true,
      expiresAt: null,
      maxClicks: null,
      clickCount: 1,
    })

    expect(mockedSetRedisJson).toHaveBeenCalledTimes(1)
    expect(mockedSetRedisJson.mock.calls[0]?.[0]).toBe('link:redirect:abc123')
    expect(typeof mockedSetRedisJson.mock.calls[0]?.[2]).toBe('number')
  })

  it('skips cache set for expired link', async () => {
    await redirectCacheService.set({
      id: 'id-1',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      active: true,
      expiresAt: new Date(Date.now() - 60_000),
      maxClicks: null,
      clickCount: 1,
    })

    expect(mockedSetRedisJson).not.toHaveBeenCalled()
  })

  it('invalidates deduplicated short codes', async () => {
    await redirectCacheService.invalidateMany(['abc123', 'abc123', 'xyz789'])

    expect(mockedDeleteRedisKeys).toHaveBeenCalledWith([
      'link:redirect:abc123',
      'link:redirect:xyz789',
    ])
  })
})
