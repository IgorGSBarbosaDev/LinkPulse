import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../shared/errors/app-error.js'
import { linksService } from './links.service.js'
import type {
  AuthenticatedRequestUser,
  ListLinksQuery,
} from './links.types.js'

type AuthenticatedRequest = Request & {
  user?: AuthenticatedRequestUser
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

class LinksController {
  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const link = await linksService.create(userId, req.body)

      return res.status(201).json(link)
    } catch (error) {
      return next(error)
    }
  }

  list = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const query = req.query as unknown as ListLinksQuery

      const result = await linksService.list(userId, query)

      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  }

  findById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)

      const link = await linksService.findById(userId, linkId)

      return res.status(200).json(link)
    } catch (error) {
      return next(error)
    }
  }

  update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)

      const link = await linksService.update(userId, linkId, req.body)

      return res.status(200).json(link)
    } catch (error) {
      return next(error)
    }
  }

  delete = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)

      await linksService.delete(userId, linkId)

      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }

  activate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)

      const link = await linksService.activate(userId, linkId)

      return res.status(200).json(link)
    } catch (error) {
      return next(error)
    }
  }

  deactivate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)
      const linkId = getLinkIdFromParams(req)

      const link = await linksService.deactivate(userId, linkId)

      return res.status(200).json(link)
    } catch (error) {
      return next(error)
    }
  }
}

export const linksController = new LinksController()