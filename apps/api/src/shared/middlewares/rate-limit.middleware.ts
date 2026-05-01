import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error.js'
import { rateLimitService } from '../../modules/rate-limit/rate-limit.service.js'

type RateLimitIdentifierGetter = (req: Request) => string | null

type RateLimitOptions = {
  keyPrefix: string
  max: number
  windowInSeconds: number
  getIdentifier: RateLimitIdentifierGetter
}

function getIpAddress(req: Request): string {
  return req.ip || 'unknown'
}

export function byIpRateLimit(options: Omit<RateLimitOptions, 'getIdentifier'>) {
  return createRateLimitMiddleware({
    ...options,
    getIdentifier: getIpAddress,
  })
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const identifier = options.getIdentifier(req)

      if (!identifier) {
        return next()
      }

      const result = await rateLimitService.consume(
        [options.keyPrefix, identifier],
        options.max,
        options.windowInSeconds,
      )

      if (!result.allowed) {
        throw AppError.tooManyRequests()
      }

      return next()
    } catch (error) {
      if (error instanceof AppError) {
        return next(error)
      }

      // Fail-open on Redis problems to keep API available.
      return next()
    }
  }
}
