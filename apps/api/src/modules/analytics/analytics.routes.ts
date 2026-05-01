import { Router } from 'express'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'
import { validateRequest } from '../../shared/middlewares/validate-request.middleware.js'
import { analyticsController } from './analytics.controller.js'
import {
  analyticsEventsQuerySchema,
  analyticsLinkIdParamsSchema,
  clicksByDayQuerySchema,
} from './analytics.schemas.js'

export const analyticsRoutes = Router()

analyticsRoutes.use(authMiddleware)

analyticsRoutes.get(
  '/links/:id/analytics/summary',
  validateRequest(analyticsLinkIdParamsSchema),
  analyticsController.getSummary,
)

analyticsRoutes.get(
  '/links/:id/analytics/clicks-by-day',
  validateRequest(clicksByDayQuerySchema),
  analyticsController.getClicksByDay,
)

analyticsRoutes.get(
  '/links/:id/analytics/events',
  validateRequest(analyticsEventsQuerySchema),
  analyticsController.getEvents,
)

analyticsRoutes.get(
  '/analytics/top-links',
  analyticsController.getTopLinks,
)

