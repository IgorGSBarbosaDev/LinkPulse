import { ShortLink } from '@prisma/client'
import { LinkResponse } from './links.types.js'

const DEFAULT_APP_BASE_URL = 'http://localhost:3000'

function getAppBaseUrl() {
  return process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL
}

export function buildShortUrl(shortCode: string) {
  const baseUrl = getAppBaseUrl().replace(/\/$/, '')

  return `${baseUrl}/r/${shortCode}`
}

export function isLinkExpired(link: Pick<ShortLink, 'expiresAt'>) {
  if (!link.expiresAt) {
    return false
  }

  return link.expiresAt.getTime() <= Date.now()
}

export function hasReachedMaxClicks(
  link: Pick<ShortLink, 'maxClicks' | 'clickCount'>,
) {
  if (link.maxClicks === null) {
    return false
  }

  return link.clickCount >= link.maxClicks
}

export function toLinkResponse(link: ShortLink): LinkResponse {
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    customAlias: link.customAlias,
    shortUrl: buildShortUrl(link.shortCode),
    title: link.title,
    description: link.description,
    active: link.active,
    expired: isLinkExpired(link),
    reachedMaxClicks: hasReachedMaxClicks(link),
    expiresAt: link.expiresAt,
    maxClicks: link.maxClicks,
    clickCount: link.clickCount,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  }
}