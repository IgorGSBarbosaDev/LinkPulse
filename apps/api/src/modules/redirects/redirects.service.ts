import { AppError } from '../../shared/errors/app-error.js'
import { hasReachedMaxClicks, isLinkExpired } from '../links/links.mapper.js'
import { redirectsRepository } from './redirects.repository.js'
import type {
  RedirectResult,
  ResolveRedirectInput,
} from './redirects.types.js'

class RedirectsService {
  async resolveRedirect(
    input: ResolveRedirectInput,
  ): Promise<RedirectResult> {
    const link = await redirectsRepository.findRedirectLinkByShortCode(
      input.shortCode,
    )

    if (!link || link.deletedAt !== null) {
      throw AppError.notFound('Link not found.')
    }

    if (!link.active) {
      throw AppError.gone('Link is inactive.')
    }

    if (isLinkExpired(link)) {
      throw AppError.gone('Link has expired.')
    }

    if (hasReachedMaxClicks(link)) {
      throw AppError.gone('Link has reached its maximum number of clicks.')
    }

    await redirectsRepository.createAccessEvent({
      shortLinkId: link.id,
      ipAddress: input.metadata.ipAddress,
      userAgent: input.metadata.userAgent,
      referer: input.metadata.referer,
    })

    await redirectsRepository.incrementClickCount(link.id)

    return {
      originalUrl: link.originalUrl,
    }
  }
}

export const redirectsService = new RedirectsService()
