import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../shared/errors/app-error.js'
import { analyticsService } from './analytics.service.js'
import type {
  AnalyticsEventsQuery,
  ClicksByDayQuery,
} from './analytics.types.js'

type AuthenticatedRequest = Request & {
  user?: {
    id: string
    email?: string
  }
}

function getAuthenticatedUserId(req: AuthenticatedRequest): string {
  const userId = req.user?.id

  if (!userId) {
    throw AppError.unauthorized('User not authenticated.')
  }

  return userId
}

function getLinkIdFromParams(req: Request): string {
  const { id } = req.params

  if (typeof id !== 'string' || id.trim().length === 0) {
    throw AppError.badRequest('Invalid link ID.')
  }

  return id
}

class AnalyticsController {
  getSummary = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)
      const result = await analyticsService.getSummary(userId, linkId)
      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  }

  getClicksByDay = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)
      const query = req.query as unknown as ClicksByDayQuery
      const result = await analyticsService.getClicksByDay(userId, linkId, query)
      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  }

  getEvents = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)
      const query = req.query as unknown as AnalyticsEventsQuery
      const result = await analyticsService.getEvents(userId, linkId, query)
      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  }

  getTopLinks = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const result = await analyticsService.getTopLinks(userId)
      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  }
}

export const analyticsController = new AnalyticsController()

