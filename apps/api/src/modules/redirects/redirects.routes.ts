import { Router } from 'express'
import { env } from '../../shared/config/env.js'
import { byIpRateLimit } from '../../shared/middlewares/rate-limit.middleware.js'
import { validateRequest } from '../../shared/middlewares/validate-request.middleware.js'
import { redirectsController } from './redirects.controller.js'
import { redirectParamsSchema } from './redirects.schemas.js'

export const redirectRoutes = Router()

redirectRoutes.get(
  '/:shortCode',
  byIpRateLimit({
    keyPrefix: 'rate:redirect',
    max: env.RATE_LIMIT_REDIRECT_MAX,
    windowInSeconds: env.RATE_LIMIT_REDIRECT_WINDOW_SECONDS,
  }),
  validateRequest(redirectParamsSchema),
  redirectsController.redirect,
)
