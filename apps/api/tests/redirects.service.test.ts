import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../src/shared/errors/app-error.js'
import { redirectsService } from '../src/modules/redirects/redirects.service.js'
import { redirectCacheService } from '../src/modules/redirects/redirect-cache.service.js'
import { redirectsRepository } from '../src/modules/redirects/redirects.repository.js'

vi.mock('../src/modules/redirects/redirects.repository.js', () => ({
  redirectsRepository: {
    findRedirectLinkByShortCode: vi.fn(),
    recordAccessAndIncrementClickCount: vi.fn(),
  },
}))

vi.mock('../src/modules/redirects/redirect-cache.service.js', () => ({
  redirectCacheService: {
    get: vi.fn(),
    set: vi.fn(),
    invalidateMany: vi.fn(),
  },
}))

const mockedRedirectsRepository = vi.mocked(redirectsRepository)
const mockedRedirectCacheService = vi.mocked(redirectCacheService)

const baseLink = {
  id: 'link-id',
  originalUrl: 'https://example.com/page',
  shortCode: 'abc123',
  active: true,
  expiresAt: null,
  maxClicks: null,
  clickCount: 2,
  deletedAt: null,
}

describe('redirectsService.resolveRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRedirectCacheService.get.mockResolvedValue(null)
  })

  it('returns original URL and records access for valid link', async () => {
    mockedRedirectsRepository.findRedirectLinkByShortCode.mockResolvedValue(
      baseLink,
    )
    mockedRedirectsRepository.recordAccessAndIncrementClickCount.mockResolvedValue(
      undefined,
    )

    const result = await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })

    expect(result).toEqual({
      originalUrl: 'https://example.com/page',
    })
    expect(
      mockedRedirectsRepository.findRedirectLinkByShortCode,
    ).toHaveBeenCalledWith('abc123')
    expect(mockedRedirectCacheService.set).toHaveBeenCalledTimes(1)
    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).toHaveBeenCalledWith({
      shortLinkId: 'link-id',
      ipAddress: '127.0.0.1',
      userAgent: 'vitest-agent',
      referer: 'https://referrer.test',
    })
  })

  it('uses cache hit and skips database fetch', async () => {
    mockedRedirectCacheService.get.mockResolvedValue({
      id: 'link-id',
      originalUrl: 'https://example.com/page',
      shortCode: 'abc123',
      active: true,
      expiresAt: null,
      maxClicks: null,
      clickCount: 3,
    })
    mockedRedirectsRepository.recordAccessAndIncrementClickCount.mockResolvedValue(
      undefined,
    )

    const result = await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })

    expect(result).toEqual({
      originalUrl: 'https://example.com/page',
    })
    expect(
      mockedRedirectsRepository.findRedirectLinkByShortCode,
    ).not.toHaveBeenCalled()
    expect(mockedRedirectCacheService.set).not.toHaveBeenCalled()
    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).toHaveBeenCalledTimes(1)
  })

  it('handles repeated cached redirects without throwing 500-style runtime errors', async () => {
    mockedRedirectCacheService.get.mockResolvedValue({
      id: 'link-id',
      originalUrl: 'https://example.com/page',
      shortCode: 'abc123',
      active: true,
      expiresAt: null,
      maxClicks: null,
      clickCount: 0,
    })
    mockedRedirectsRepository.recordAccessAndIncrementClickCount.mockResolvedValue(
      undefined,
    )

    const firstResult = await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })
    const secondResult = await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })

    expect(firstResult).toEqual({ originalUrl: 'https://example.com/page' })
    expect(secondResult).toEqual({ originalUrl: 'https://example.com/page' })
    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).toHaveBeenCalledTimes(2)
  })

  it('does not trust stale cached clickCount for maxClicks checks', async () => {
    mockedRedirectCacheService.get.mockResolvedValue({
      id: 'link-id',
      originalUrl: 'https://example.com/page',
      shortCode: 'abc123',
      active: true,
      expiresAt: null,
      maxClicks: 2,
      clickCount: 2,
    })
    mockedRedirectsRepository.recordAccessAndIncrementClickCount.mockResolvedValue(
      undefined,
    )

    const result = await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })

    expect(result).toEqual({ originalUrl: 'https://example.com/page' })
    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).toHaveBeenCalledTimes(1)
  })

  it('invalidates cache when repository rejects stale cached maxClicks on third click', async () => {
    mockedRedirectCacheService.get.mockResolvedValue({
      id: 'link-id',
      originalUrl: 'https://example.com/page',
      shortCode: 'abc123',
      active: true,
      expiresAt: null,
      maxClicks: 2,
      clickCount: 0,
    })
    mockedRedirectsRepository.recordAccessAndIncrementClickCount
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(AppError.gone('Link is no longer available.'))

    await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })
    await redirectsService.resolveRedirect({
      shortCode: 'abc123',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest-agent',
        referer: 'https://referrer.test',
      },
    })

    await expect(
      redirectsService.resolveRedirect({
        shortCode: 'abc123',
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: 'vitest-agent',
          referer: 'https://referrer.test',
        },
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 410,
      error: 'Gone',
    })

    expect(mockedRedirectCacheService.invalidateMany).toHaveBeenCalledWith([
      'abc123',
    ])
  })

  it('throws not found when short code does not exist', async () => {
    mockedRedirectsRepository.findRedirectLinkByShortCode.mockResolvedValue(null)

    await expect(
      redirectsService.resolveRedirect({
        shortCode: 'missing',
        metadata: {
          ipAddress: null,
          userAgent: null,
          referer: null,
        },
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 404,
      error: 'Not Found',
    })

    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).not.toHaveBeenCalled()
  })

  it('throws not found when link is soft deleted', async () => {
    mockedRedirectsRepository.findRedirectLinkByShortCode.mockResolvedValue({
      ...baseLink,
      deletedAt: new Date(),
    })

    await expect(
      redirectsService.resolveRedirect({
        shortCode: 'abc123',
        metadata: {
          ipAddress: null,
          userAgent: null,
          referer: null,
        },
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 404,
      error: 'Not Found',
    })

    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).not.toHaveBeenCalled()
  })

  it('throws gone when link is inactive', async () => {
    mockedRedirectsRepository.findRedirectLinkByShortCode.mockResolvedValue({
      ...baseLink,
      active: false,
    })

    await expect(
      redirectsService.resolveRedirect({
        shortCode: 'abc123',
        metadata: {
          ipAddress: null,
          userAgent: null,
          referer: null,
        },
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 410,
      error: 'Gone',
    })

    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).not.toHaveBeenCalled()
  })

  it('throws gone when link is expired', async () => {
    mockedRedirectsRepository.findRedirectLinkByShortCode.mockResolvedValue({
      ...baseLink,
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    })

    await expect(
      redirectsService.resolveRedirect({
        shortCode: 'abc123',
        metadata: {
          ipAddress: null,
          userAgent: null,
          referer: null,
        },
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 410,
      error: 'Gone',
    })

    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).not.toHaveBeenCalled()
  })

  it('throws gone when max clicks reached', async () => {
    mockedRedirectsRepository.findRedirectLinkByShortCode.mockResolvedValue({
      ...baseLink,
      maxClicks: 2,
      clickCount: 2,
    })

    await expect(
      redirectsService.resolveRedirect({
        shortCode: 'abc123',
        metadata: {
          ipAddress: null,
          userAgent: null,
          referer: null,
        },
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 410,
      error: 'Gone',
    })

    expect(
      mockedRedirectsRepository.recordAccessAndIncrementClickCount,
    ).not.toHaveBeenCalled()
  })
})
