import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redirectCacheService } from '../src/modules/redirects/redirect-cache.service.js'
import { linksRepository } from '../src/modules/links/links.repository.js'
import { linksService } from '../src/modules/links/links.service.js'

vi.mock('../src/modules/links/links.repository.js', () => ({
  linksRepository: {
    findByIdAndUserId: vi.fn(),
    findByShortCode: vi.fn(),
    findByCustomAlias: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    create: vi.fn(),
    listByUser: vi.fn(),
  },
}))

vi.mock('../src/modules/redirects/redirect-cache.service.js', () => ({
  redirectCacheService: {
    invalidateMany: vi.fn(),
  },
}))

const mockedLinksRepository = vi.mocked(linksRepository)
const mockedRedirectCacheService = vi.mocked(redirectCacheService)

const baseLink = {
  id: 'link-id',
  userId: 'user-id',
  originalUrl: 'https://example.com',
  shortCode: 'abc123',
  customAlias: null,
  title: null,
  description: null,
  active: true,
  expiresAt: null,
  maxClicks: null,
  clickCount: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
}

describe('linksService cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedLinksRepository.findByIdAndUserId.mockResolvedValue(baseLink)
  })

  it('invalidates old and new shortCode on alias change', async () => {
    mockedLinksRepository.findByShortCode.mockResolvedValue(null)
    mockedLinksRepository.findByCustomAlias.mockResolvedValue(null)
    mockedLinksRepository.update.mockResolvedValue({
      ...baseLink,
      shortCode: 'newalias',
      customAlias: 'newalias',
    })

    await linksService.update('user-id', 'link-id', {
      customAlias: 'newalias',
    })

    expect(mockedRedirectCacheService.invalidateMany).toHaveBeenCalledWith([
      'abc123',
      'newalias',
    ])
  })

  it('invalidates on delete', async () => {
    mockedLinksRepository.softDelete.mockResolvedValue(baseLink)

    await linksService.delete('user-id', 'link-id')

    expect(mockedRedirectCacheService.invalidateMany).toHaveBeenCalledWith([
      'abc123',
    ])
  })

  it('invalidates on activate/deactivate', async () => {
    mockedLinksRepository.update.mockResolvedValue(baseLink)

    await linksService.activate('user-id', 'link-id')
    await linksService.deactivate('user-id', 'link-id')

    expect(mockedRedirectCacheService.invalidateMany).toHaveBeenNthCalledWith(1, [
      'abc123',
    ])
    expect(mockedRedirectCacheService.invalidateMany).toHaveBeenNthCalledWith(2, [
      'abc123',
    ])
  })
})
