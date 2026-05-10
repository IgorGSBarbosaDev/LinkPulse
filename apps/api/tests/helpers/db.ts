import { randomUUID } from 'node:crypto'
import { prisma } from '../../src/shared/config/prisma.js'

type CreateUserOverrides = {
  email?: string
  name?: string
}

type CreateLinkOverrides = {
  userId: string
  shortCode?: string
  customAlias?: string | null
  active?: boolean
  deletedAt?: Date | null
  title?: string | null
}

export async function resetDatabase() {
  await prisma.linkAccessEvent.deleteMany()
  await prisma.shortLink.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
  await prisma.user.deleteMany()
}

export async function createUser(overrides: CreateUserOverrides = {}) {
  const id = randomUUID()

  return prisma.user.create({
    data: {
      id,
      name: overrides.name ?? `User ${id.slice(0, 8)}`,
      email: overrides.email ?? `${id}@example.com`,
      passwordHash: 'hashed-password',
      emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  })
}

export async function createShortLink(overrides: CreateLinkOverrides) {
  const id = randomUUID()
  const codeSeed = overrides.shortCode ?? `code-${id.slice(0, 8)}`

  return prisma.shortLink.create({
    data: {
      id,
      userId: overrides.userId,
      originalUrl: `https://example.com/${id}`,
      shortCode: codeSeed,
      customAlias: overrides.customAlias ?? null,
      title: overrides.title ?? null,
      description: null,
      active: overrides.active ?? true,
      expiresAt: null,
      maxClicks: null,
      clickCount: 0,
      deletedAt: overrides.deletedAt ?? null,
    },
  })
}
