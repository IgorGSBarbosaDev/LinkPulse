import { randomBytes } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../shared/config/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import { redirectCacheService } from '../redirects/redirect-cache.service.js'
import { linksRepository } from './links.repository.js'
import { toLinkResponse } from './links.mapper.js'
import type {
  CreateLinkInput,
  LinkResponse,
  ListLinksQuery,
  PaginatedResult,
  UpdateLinkInput,
} from './links.types.js'

const SHORT_CODE_LENGTH = 7
const SHORT_CODE_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateShortCode(length = SHORT_CODE_LENGTH): string {
  const bytes = randomBytes(length)

  return Array.from(bytes)
    .map((byte) => SHORT_CODE_ALPHABET[byte % SHORT_CODE_ALPHABET.length])
    .join('')
}

function normalizeUrl(url: string): string {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url.trim())
  } catch {
    throw AppError.badRequest('Original URL must be valid.')
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw AppError.badRequest('Original URL must use HTTP or HTTPS.')
  }

  return parsedUrl.toString()
}

function toDateOrNull(value: Date | string | null): Date | null {
  if (value === null) {
    return null
  }

  return value instanceof Date ? value : new Date(value)
}

class LinksService {
  async create(
    userId: string,
    data: CreateLinkInput,
  ): Promise<LinkResponse> {
    const originalUrl = normalizeUrl(data.originalUrl)
    const customAlias = data.customAlias ?? null

    const link = await prisma.$transaction(async (tx) => {
      if (customAlias) {
        await this.ensureShortCodeIsAvailable(customAlias, undefined, tx)
      }

      const shortCode =
        customAlias ?? (await this.generateUniqueShortCode(tx))

      return linksRepository.create(
        {
          userId,
          originalUrl,
          shortCode,
          customAlias,
          title: data.title ?? null,
          description: data.description ?? null,
          expiresAt: data.expiresAt ?? null,
          maxClicks: data.maxClicks ?? null,
        },
        tx,
      )
    })

    return toLinkResponse(link)
  }

  async list(
    userId: string,
    filters: ListLinksQuery,
  ): Promise<PaginatedResult<LinkResponse>> {
    const { links, totalItems } = await linksRepository.listByUser(
      userId,
      filters,
    )

    const totalPages = Math.ceil(totalItems / filters.limit)

    return {
      data: links.map(toLinkResponse),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalItems,
        totalPages,
      },
    }
  }

  async findById(userId: string, linkId: string): Promise<LinkResponse> {
    const link = await this.getUserLinkOrFail(userId, linkId)

    return toLinkResponse(link)
  }

  async update(
    userId: string,
    linkId: string,
    data: UpdateLinkInput,
  ): Promise<LinkResponse> {
    const link = await this.getUserLinkOrFail(userId, linkId)

    const updateData: {
      originalUrl?: string
      shortCode?: string
      customAlias?: string | null
      title?: string | null
      description?: string | null
      active?: boolean
      expiresAt?: Date | null
      maxClicks?: number | null
    } = {}

    if (data.originalUrl !== undefined) {
      updateData.originalUrl = normalizeUrl(data.originalUrl)
    }

    if (data.customAlias !== undefined && data.customAlias !== link.shortCode) {
      await this.ensureShortCodeIsAvailable(data.customAlias, link.id)

      updateData.shortCode = data.customAlias
      updateData.customAlias = data.customAlias
    }

    if (data.title !== undefined) {
      updateData.title = data.title
    }

    if (data.description !== undefined) {
      updateData.description = data.description
    }

    if (data.active !== undefined) {
      updateData.active = data.active
    }

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = toDateOrNull(data.expiresAt)
    }

    if (data.maxClicks !== undefined) {
      updateData.maxClicks = data.maxClicks
    }

    const updatedLink = await linksRepository.update(link.id, updateData)

    await this.invalidateRedirectCache(link.shortCode, updatedLink.shortCode)

    return toLinkResponse(updatedLink)
  }

  async delete(userId: string, linkId: string): Promise<void> {
    const link = await this.getUserLinkOrFail(userId, linkId)

    await linksRepository.softDelete(link.id)

    await this.invalidateRedirectCache(link.shortCode)
  }

  async activate(userId: string, linkId: string): Promise<LinkResponse> {
    const link = await this.getUserLinkOrFail(userId, linkId)

    const updatedLink = await linksRepository.update(link.id, {
      active: true,
    })

    await this.invalidateRedirectCache(link.shortCode)

    return toLinkResponse(updatedLink)
  }

  async deactivate(userId: string, linkId: string): Promise<LinkResponse> {
    const link = await this.getUserLinkOrFail(userId, linkId)

    const updatedLink = await linksRepository.update(link.id, {
      active: false,
    })

    await this.invalidateRedirectCache(link.shortCode)

    return toLinkResponse(updatedLink)
  }

  private async getUserLinkOrFail(userId: string, linkId: string) {
    const link = await linksRepository.findByIdAndUserId(linkId, userId)

    if (!link) {
      throw AppError.notFound('Link not found.')
    }

    return link
  }

  private async generateUniqueShortCode(
    db?: Prisma.TransactionClient,
  ): Promise<string> {
    const maxAttempts = 5

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const shortCode = generateShortCode()
      const existingLink = await linksRepository.findByShortCode(shortCode, db)

      if (!existingLink) {
        return shortCode
      }
    }

    throw AppError.internal('Failed to generate a unique short code.')
  }

  private async ensureShortCodeIsAvailable(
    shortCode: string,
    currentLinkId?: string,
    db?: Prisma.TransactionClient,
  ): Promise<void> {
    const existingByShortCode = await linksRepository.findByShortCode(
      shortCode,
      db,
    )

    if (existingByShortCode && existingByShortCode.id !== currentLinkId) {
      throw AppError.conflict(
        'This short code is already in use.',
        undefined,
        'CONFLICT',
      )
    }

    const existingByAlias = await linksRepository.findByCustomAlias(
      shortCode,
      db,
    )

    if (existingByAlias && existingByAlias.id !== currentLinkId) {
      throw AppError.conflict(
        'This alias is already in use.',
        undefined,
        'CONFLICT',
      )
    }
  }

  private async invalidateRedirectCache(
    ...shortCodes: Array<string | null | undefined>
  ): Promise<void> {
    await redirectCacheService.invalidateMany(shortCodes)
  }

}

export const linksService = new LinksService()
