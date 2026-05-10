import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../src/shared/errors/app-error.js'
import { prisma } from '../src/shared/config/prisma.js'
import { redirectCacheService } from '../src/modules/redirects/redirect-cache.service.js'
import { linksRepository } from '../src/modules/links/links.repository.js'
import { linksService } from '../src/modules/links/links.service.js'

vi.mock('../src/shared/config/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(async (callback) => callback({})),
  },
}))

vi.mock('../src/modules/links/links.repository.js', () => ({
  linksRepository: {
    acquireQuotaCreateLock: vi.fn(),
    findByIdAndUserId: vi.fn(),
    findByShortCode: vi.fn(),
    findByCustomAlias: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    create: vi.fn(),
    listByUser: vi.fn(),
    countNonDeletedByUserId: vi.fn(),
  },
}))

vi.mock('../src/modules/redirects/redirect-cache.service.js', () => ({
  redirectCacheService: {
    invalidateMany: vi.fn(),
  },
}))

const mockedLinksRepository = vi.mocked(linksRepository)
const mockedRedirectCacheService = vi.mocked(redirectCacheService)
const mockedPrisma = vi.mocked(prisma)

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
    mockedPrisma.$transaction.mockImplementation(async (callback) => callback({}))
    mockedLinksRepository.findByIdAndUserId.mockResolvedValue(baseLink)
    mockedLinksRepository.countNonDeletedByUserId.mockResolvedValue(0)
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

  it('invalidates cache when link is saved without changing shortCode', async () => {
    mockedLinksRepository.update.mockResolvedValue({
      ...baseLink,
      title: 'Updated title',
    })

    await linksService.update('user-id', 'link-id', {
      title: 'Updated title',
    })

    expect(mockedRedirectCacheService.invalidateMany).toHaveBeenCalledWith([
      'abc123',
      'abc123',
    ])
  })
})

describe('linksService quota enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedPrisma.$transaction.mockImplementation(async (callback) => callback({}))
    mockedLinksRepository.acquireQuotaCreateLock.mockResolvedValue(undefined)
    mockedLinksRepository.findByShortCode.mockResolvedValue(null)
    mockedLinksRepository.findByCustomAlias.mockResolvedValue(null)
    mockedLinksRepository.create.mockResolvedValue(baseLink)
    mockedLinksRepository.countNonDeletedByUserId.mockResolvedValue(0)
  })

  it('allows create when repository count is below quota', async () => {
    mockedLinksRepository.countNonDeletedByUserId.mockResolvedValue(14)

    await linksService.create('user-id', {
      originalUrl: 'https://example.com/page',
    })

    expect(mockedLinksRepository.create).toHaveBeenCalledTimes(1)
  })

  it('blocks create when repository count reaches quota', async () => {
    mockedLinksRepository.countNonDeletedByUserId.mockResolvedValue(15)

    await expect(
      linksService.create('user-id', {
        originalUrl: 'https://example.com/page',
      }),
    ).rejects.toMatchObject<AppError>({
      statusCode: 403,
      code: 'LINK_LIMIT_REACHED',
      message: 'You have reached the maximum limit of 15 links.',
    })

    expect(mockedLinksRepository.create).not.toHaveBeenCalled()
  })

  it('returns quota metadata based on active non-deleted links count', async () => {
    mockedLinksRepository.countNonDeletedByUserId.mockResolvedValue(14)
    mockedLinksRepository.listByUser.mockResolvedValue({
      links: [baseLink],
      totalItems: 1,
    })

    const result = await linksService.list('user-id', {
      page: 1,
      limit: 10,
      search: '',
      active: undefined,
      sort: 'createdAt',
      order: 'desc',
    })

    expect(result.quota).toEqual({
      limit: 15,
      used: 14,
      remaining: 1,
    })
  })
})
