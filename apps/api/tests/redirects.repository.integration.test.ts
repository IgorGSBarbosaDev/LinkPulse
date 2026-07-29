import { randomUUID } from 'node:crypto'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'

import { prisma } from '../src/shared/config/prisma.js'
import { redirectsRepository } from '../src/modules/redirects/redirects.repository.js'

const hasTestDatabase = Boolean(process.env.DATABASE_URL_TEST)

describe.skipIf(!hasTestDatabase)('redirects repository concurrency', () => {
  let linkId: string
  let userId: string

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Concurrency Test',
        email: `${randomUUID()}@example.test`,
        passwordHash: 'not-used',
      },
    })
    userId = user.id

    const link = await prisma.shortLink.create({
      data: {
        userId,
        originalUrl: 'https://example.com/concurrency',
        shortCode: `concurrency-${randomUUID()}`,
        maxClicks: 5,
      },
    })
    linkId = link.id
  })

  afterEach(async () => {
    await prisma.linkAccessEvent.deleteMany({ where: { shortLinkId: linkId } })
    await prisma.shortLink.delete({ where: { id: linkId } })
    await prisma.user.delete({ where: { id: userId } })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('never increments past maxClicks under concurrent redirects', async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, (_, index) =>
        redirectsRepository.recordAccessAndIncrementClickCount({
          shortLinkId: linkId,
          ipAddress: `127.0.0.${index + 1}`,
          userAgent: 'playwright-concurrency-test',
          referer: null,
        }),
      ),
    )

    const successfulCounts = results
      .filter((result): result is PromiseFulfilledResult<number> => result.status === 'fulfilled')
      .map((result) => result.value)
    const storedLink = await prisma.shortLink.findUnique({
      where: { id: linkId },
      select: { clickCount: true },
    })
    const eventCount = await prisma.linkAccessEvent.count({
      where: { shortLinkId: linkId },
    })

    expect(successfulCounts).toHaveLength(5)
    expect(Math.max(...successfulCounts)).toBe(5)
    expect(storedLink?.clickCount).toBe(5)
    expect(eventCount).toBe(5)
  })
})
