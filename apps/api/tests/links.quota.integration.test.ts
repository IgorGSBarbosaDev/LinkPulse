import { randomUUID } from 'node:crypto'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../src/shared/config/prisma.js'
import { linksService } from '../src/modules/links/links.service.js'
import { resetDatabase, createShortLink, createUser } from './helpers/db.js'

async function canConnectToDatabase() {
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    return true
  } catch {
    return false
  }
}

const hasReachableDatabase = await canConnectToDatabase()
const describeIfDatabase = hasReachableDatabase ? describe : describe.skip

async function seedLinks(
  userId: string,
  count: number,
  options: {
    active?: boolean
    deletedAt?: Date | null
    prefix?: string
  } = {},
) {
  for (let index = 0; index < count; index += 1) {
    await createShortLink({
      userId,
      active: options.active,
      deletedAt: options.deletedAt,
      shortCode: `${options.prefix ?? 'seed'}-${index}-${randomUUID().slice(0, 6)}`,
    })
  }
}

describeIfDatabase('links quota integration', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('allows creating the 15th non-deleted link', async () => {
    const user = await createUser()
    await seedLinks(user.id, 14, { prefix: 'under-limit' })

    const result = await linksService.create(user.id, {
      originalUrl: 'https://example.com/new-link',
      customAlias: `limit-ok-${randomUUID().slice(0, 8)}`,
    })

    expect(result.id).toBeTruthy()
    await expect(
      prisma.shortLink.count({
        where: { userId: user.id, deletedAt: null },
      }),
    ).resolves.toBe(15)
  })

  it('blocks creation when user already has 15 non-deleted links', async () => {
    const user = await createUser()
    await seedLinks(user.id, 15, { prefix: 'at-limit' })

    await expect(
      linksService.create(user.id, {
        originalUrl: 'https://example.com/blocked',
        customAlias: `blocked-${randomUUID().slice(0, 8)}`,
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'LINK_LIMIT_REACHED',
    })
  })

  it('does not count soft-deleted links toward the quota', async () => {
    const user = await createUser()
    await seedLinks(user.id, 14, { prefix: 'active' })
    await seedLinks(user.id, 2, {
      prefix: 'deleted',
      deletedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    const result = await linksService.create(user.id, {
      originalUrl: 'https://example.com/soft-delete-gap',
      customAlias: `soft-gap-${randomUUID().slice(0, 8)}`,
    })

    expect(result.id).toBeTruthy()
    await expect(
      prisma.shortLink.count({
        where: { userId: user.id, deletedAt: null },
      }),
    ).resolves.toBe(15)
  })

  it('counts inactive non-deleted links toward the quota', async () => {
    const user = await createUser()
    await seedLinks(user.id, 10, { prefix: 'active-links' })
    await seedLinks(user.id, 5, { prefix: 'inactive-links', active: false })

    await expect(
      linksService.create(user.id, {
        originalUrl: 'https://example.com/inactive-still-counts',
        customAlias: `inactive-${randomUUID().slice(0, 8)}`,
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'LINK_LIMIT_REACHED',
    })
  })

  it('does not count links from another user toward the quota', async () => {
    const targetUser = await createUser()
    const otherUser = await createUser()

    await seedLinks(targetUser.id, 14, { prefix: 'target' })
    await seedLinks(otherUser.id, 15, { prefix: 'other' })

    const result = await linksService.create(targetUser.id, {
      originalUrl: 'https://example.com/other-user-ignored',
      customAlias: `other-ignored-${randomUUID().slice(0, 8)}`,
    })

    expect(result.id).toBeTruthy()
    await expect(
      prisma.shortLink.count({
        where: { userId: targetUser.id, deletedAt: null },
      }),
    ).resolves.toBe(15)
  })

  it('serializes concurrent creates so only one succeeds from 14 existing links', async () => {
    const user = await createUser()
    await seedLinks(user.id, 14, { prefix: 'concurrent' })

    const [firstResult, secondResult] = await Promise.allSettled([
      linksService.create(user.id, {
        originalUrl: 'https://example.com/concurrent-a',
        customAlias: `concurrent-a-${randomUUID().slice(0, 8)}`,
      }),
      linksService.create(user.id, {
        originalUrl: 'https://example.com/concurrent-b',
        customAlias: `concurrent-b-${randomUUID().slice(0, 8)}`,
      }),
    ])

    const successfulCreates = [firstResult, secondResult].filter(
      (result) => result.status === 'fulfilled',
    )
    const rejectedCreates = [firstResult, secondResult].filter(
      (result) => result.status === 'rejected',
    )

    expect(successfulCreates).toHaveLength(1)
    expect(rejectedCreates).toHaveLength(1)
    expect(rejectedCreates[0]).toMatchObject({
      reason: {
        statusCode: 403,
        code: 'LINK_LIMIT_REACHED',
      },
    })

    await expect(
      prisma.shortLink.count({
        where: { userId: user.id, deletedAt: null },
      }),
    ).resolves.toBe(15)
  })
})
