import { randomBytes } from 'node:crypto'
import { redis } from '../../shared/config/redis'
import { AppError } from '../../shared/errors/app-error.js'
import { linksRepository } from './links.repository.js'
import {
  CreateLinkInput,
  LinkResponse,
  ListLinksQuery,
  PaginatedResult,
  UpdateLinkInput,
} from './links.types.js'
import { toLinkResponse } from './links.mapper.js'

const SHORT_CODE_LENGTH = 7
const SHORT_CODE_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateShortCode(length = SHORT_CODE_LENGTH) {
  const bytes = randomBytes(length)

  return Array.from(bytes)
    .map((byte) => SHORT_CODE_ALPHABET[byte % SHORT_CODE_ALPHABET.length])
    .join('')
}

function normalizeUrl(url: string) {
  return new URL(url.trim()).toString()
}

function toDateOrNull(value: Date | string | null | undefined) {
  if (value === undefined) {
    return undefined
  }

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

    if (customAlias) {
      await this.ensureShortCodeIsAvailable(customAlias)
    }

    const shortCode = customAlias ?? await this.generateUniqueShortCode()

    const link = await linksRepository.create({
      userId,
      originalUrl,
      shortCode,
      customAlias,
      title: data.title ?? null,
      description: data.description ?? null,
      expiresAt: data.expiresAt ?? null,
      maxClicks: data.maxClicks ?? null,
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
    const link = await linksRepository.findByIdAndUserId(linkId, userId)

    if (!link) {
      throw new AppError('Link não encontrado.', 404)
    }

    return toLinkResponse(link)
  }

  async update(
    userId: string,
    linkId: string,
    data: UpdateLinkInput,
  ): Promise<LinkResponse> {
    const link = await linksRepository.findByIdAndUserId(linkId, userId)

    if (!link) {
      throw new AppError('Link não encontrado.', 404)
    }

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
    const link = await linksRepository.findByIdAndUserId(linkId, userId)

    if (!link) {
      throw new AppError('Link not found.', 404)
    }

    await linksRepository.softDelete(link.id)

    await this.invalidateRedirectCache(link.shortCode)
  }

  async activate(userId: string, linkId: string): Promise<LinkResponse> {
    const link = await linksRepository.findByIdAndUserId(linkId, userId)

    if (!link) {
      throw new AppError('Link not found.', 404)
    }

    const updatedLink = await linksRepository.update(link.id, {
      active: true,
    })

    await this.invalidateRedirectCache(link.shortCode)

    return toLinkResponse(updatedLink)
  }

  async deactivate(userId: string, linkId: string): Promise<LinkResponse> {
    const link = await linksRepository.findByIdAndUserId(linkId, userId)

    if (!link) {
      throw new AppError('Link not found.', 404)
    }

    const updatedLink = await linksRepository.update(link.id, {
      active: false,
    })

    await this.invalidateRedirectCache(link.shortCode)

    return toLinkResponse(updatedLink)
  }

  private async generateUniqueShortCode() {
    const maxAttempts = 5

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const shortCode = generateShortCode()
      const existingLink = await linksRepository.findByShortCode(shortCode)

      if (!existingLink) {
        return shortCode
      }
    }

    throw new AppError('Failed to generate a unique short code.', 500)
  }

  private async ensureShortCodeIsAvailable(
    shortCode: string,
    currentLinkId?: string,
  ) {
    const existingByShortCode = await linksRepository.findByShortCode(shortCode)

    if (existingByShortCode && existingByShortCode.id !== currentLinkId) {
      throw new AppError('This short code is already in use.', 409)
    }

    const existingByAlias = await linksRepository.findByCustomAlias(shortCode)

    if (existingByAlias && existingByAlias.id !== currentLinkId) {
      throw new AppError('This alias is already in use.', 409)
    }
  }

  private async invalidateRedirectCache(
    ...shortCodes: Array<string | null | undefined>
  ) {
    const uniqueShortCodes = Array.from(
      new Set(shortCodes.filter(Boolean)),
    ) as string[]

    if (uniqueShortCodes.length === 0) {
      return
    }

    const keys = uniqueShortCodes.map(
      (shortCode) => `link:redirect:${shortCode}`,
    )

    try {
      await redis.del(...keys)
    } catch {
      // Redis don't prevent the main operation in PostgreSQL.
    }
  }
}

export const linksService = new LinksService()