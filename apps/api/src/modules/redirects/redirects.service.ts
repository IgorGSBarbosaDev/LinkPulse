import { AppError } from '../../shared/errors/app-error.js'
import { hasReachedMaxClicks, isLinkExpired } from '../links/links.mapper.js'
import { redirectCacheService } from './redirect-cache.service.js'
import { redirectsRepository } from './redirects.repository.js'
import type {
  RedirectResult,
  ResolveRedirectInput,
} from './redirects.types.js'

class RedirectsService {
  async resolveRedirect(
    input: ResolveRedirectInput,
  ): Promise<RedirectResult> {
    const cachedLink = await redirectCacheService.get(input.shortCode)
    const dbLink = cachedLink
      ? null
      : await redirectsRepository.findRedirectLinkByShortCode(input.shortCode)
    const link = cachedLink ?? dbLink

    if (!link) {
      throw AppError.notFound('Link not found.')
    }

    if (dbLink && dbLink.deletedAt !== null) {
      throw AppError.notFound('Link not found.')
    }

    if (!link.active) {
      throw AppError.gone('Link is inactive.')
    }

    if (isLinkExpired(link)) {
      throw AppError.gone('Link has expired.')
    }

    if (dbLink && hasReachedMaxClicks(link)) {
      throw AppError.gone('Link has reached its maximum number of clicks.')
    }

    if (!cachedLink) {
      await redirectCacheService.set({
        id: link.id,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        active: link.active,
        expiresAt: link.expiresAt,
        maxClicks: link.maxClicks,
        clickCount: link.clickCount,
      })
    }

    try {
      const updatedClickCount =
        await redirectsRepository.recordAccessAndIncrementClickCount({
        shortLinkId: link.id,
        ipAddress: input.metadata.ipAddress,
        userAgent: input.metadata.userAgent,
        referer: input.metadata.referer,
      })

      await redirectCacheService.set({
        id: link.id,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        active: link.active,
        expiresAt: link.expiresAt,
        maxClicks: link.maxClicks,
        clickCount: updatedClickCount,
      })
    } catch (error) {
      if (error instanceof AppError) {
        await redirectCacheService.invalidateMany([input.shortCode])
      }

      throw error
    }

    return {
      originalUrl: link.originalUrl,
    }
  }
}

export const redirectsService = new RedirectsService()
