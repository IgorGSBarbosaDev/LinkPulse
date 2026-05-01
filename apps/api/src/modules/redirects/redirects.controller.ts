import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../shared/errors/app-error.js'
import { redirectsService } from './redirects.service.js'

function getShortCodeFromParams(req: Request): string {
  const { shortCode } = req.params

  if (typeof shortCode !== 'string' || shortCode.trim().length === 0) {
    throw AppError.badRequest('Invalid short code.')
  }

  return shortCode
}

function getHeaderValue(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  if (Array.isArray(value)) {
    const firstValue = value.find(
      (item) => typeof item === 'string' && item.trim().length > 0,
    )

    return firstValue ?? null
  }

  return null
}

class RedirectsController {
  redirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shortCode = getShortCodeFromParams(req)

      const { originalUrl } = await redirectsService.resolveRedirect({
        shortCode,
        metadata: {
          ipAddress: req.ip || null,
          userAgent: getHeaderValue(req.headers['user-agent']),
          referer: getHeaderValue(req.headers.referer ?? req.headers.referrer),
        },
      })

      return res.redirect(302, originalUrl)
    } catch (error) {
      return next(error)
    }
  }
}

export const redirectsController = new RedirectsController()
