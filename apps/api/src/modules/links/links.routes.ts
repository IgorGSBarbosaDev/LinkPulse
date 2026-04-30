import { Router } from 'express'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'
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