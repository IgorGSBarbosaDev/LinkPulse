import { Router } from 'express'
import { validateRequest } from '../../shared/middlewares/validate-request.middleware.js'
import { redirectsController } from './redirects.controller.js'
import { redirectParamsSchema } from './redirects.schemas.js'

export const redirectRoutes = Router()

redirectRoutes.get(
  '/:shortCode',
  validateRequest(redirectParamsSchema),
  redirectsController.redirect,
)
