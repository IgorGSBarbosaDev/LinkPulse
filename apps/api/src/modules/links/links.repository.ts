import { Prisma, ShortLink } from '@prisma/client'
import { prisma } from '../../shared/config/prisma.js'
import { ListLinksQuery } from './links.types.js'

type LinksDbClient = Prisma.TransactionClient | typeof prisma

type CreateShortLinkData = {
  userId: string
  originalUrl: string
  shortCode: string
  customAlias?: string | null
  title?: string | null
  description?: string | null
  expiresAt?: Date | null
  maxClicks?: number | null
}

type UpdateShortLinkData = {
  originalUrl?: string
  shortCode?: string
  customAlias?: string | null
  title?: string | null
  description?: string | null
  active?: boolean
  expiresAt?: Date | null
  maxClicks?: number | null
  deletedAt?: Date | null
}

type ListByUserResult = {
  links: ShortLink[]
  totalItems: number
}

class LinksRepository {
  async create(data: CreateShortLinkData, db: LinksDbClient = prisma) {
    return db.shortLink.create({
      data: {
        userId: data.userId,
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
        customAlias: data.customAlias ?? null,
        title: data.title ?? null,
        description: data.description ?? null,
        expiresAt: data.expiresAt ?? null,
        maxClicks: data.maxClicks ?? null,
        active: true,
      },
    })
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.shortLink.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })
  }

  async findByShortCode(shortCode: string, db: LinksDbClient = prisma) {
    return db.shortLink.findUnique({
      where: {
        shortCode,
      },
    })
  }

  async findByCustomAlias(
    customAlias: string,
    db: LinksDbClient = prisma,
  ) {
    return db.shortLink.findUnique({
      where: {
        customAlias,
      },
    })
  }

  async listByUser(
    userId: string,
    filters: ListLinksQuery,
  ): Promise<ListByUserResult> {
    const page = filters.page
    const limit = filters.limit
    const skip = (page - 1) * limit

    const where: Prisma.ShortLinkWhereInput = {
      userId,
      deletedAt: null,
    }

    if (typeof filters.active === 'boolean') {
      where.active = filters.active
    }

    if (filters.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          originalUrl: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          shortCode: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          customAlias: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const orderBy: Prisma.ShortLinkOrderByWithRelationInput = {
      [filters.sort]: filters.order,
    }

    const [links, totalItems] = await prisma.$transaction([
      prisma.shortLink.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),

      prisma.shortLink.count({
        where,
      }),
    ])

    return {
      links,
      totalItems,
    }
  }

  async update(id: string, data: UpdateShortLinkData) {
    return prisma.shortLink.update({
      where: {
        id,
      },
      data,
    })
  }

  async softDelete(id: string) {
    return prisma.shortLink.update({
      where: {
        id,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    })
  }

}

export const linksRepository = new LinksRepository()
