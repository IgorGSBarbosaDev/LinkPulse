import { Router } from 'express'
import { env } from '../../shared/config/env.js'
import {
  authMiddleware,
  type AuthenticatedRequest,
} from '../../shared/middlewares/auth.middleware.js'
import { createRateLimitMiddleware } from '../../shared/middlewares/rate-limit.middleware.js'
import { validateRequest } from '../../shared/middlewares/validate-request.middleware.js'
import { linksController } from './links.controller.js'
import {
  createLinkSchema,
  linkIdParamsSchema,
  listLinksSchema,
  updateLinkSchema,
} from './links.schemas.js'

export const linksRoutes = Router()

linksRoutes.use(authMiddleware)

linksRoutes.post(
  '/',
  createRateLimitMiddleware({
    keyPrefix: 'rate:create-link',
    max: env.RATE_LIMIT_CREATE_LINK_MAX,
    windowInSeconds: env.RATE_LIMIT_CREATE_LINK_WINDOW_SECONDS,
    getIdentifier: (req) => {
      const userId = (req as AuthenticatedRequest).user?.id
      return typeof userId === 'string' && userId.length > 0 ? userId : null
    },
  }),
  validateRequest(createLinkSchema),
  linksController.create,
)

linksRoutes.get(
  '/',
  validateRequest(listLinksSchema),
  linksController.list,
)

linksRoutes.get(
  '/:id',
  validateRequest(linkIdParamsSchema),
  linksController.findById,
)

linksRoutes.patch(
  '/:id/activate',
  validateRequest(linkIdParamsSchema),
  linksController.activate,
)

linksRoutes.patch(
  '/:id/deactivate',
  validateRequest(linkIdParamsSchema),
  linksController.deactivate,
)

linksRoutes.patch(
  '/:id',
  validateRequest(updateLinkSchema),
  linksController.update,
)

linksRoutes.delete(
  '/:id',
  validateRequest(linkIdParamsSchema),
  linksController.delete,
)
