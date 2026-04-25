import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/app-error.js'
import { ErrorCode } from '../errors/error-codes.js'

type JwtPayload = {
  sub: string
  email: string
  iat?: number
  exp?: number
}

export type AuthenticatedRequest = Request & {
  user?: {
    id: string
    email: string
  }
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new AppError({
        statusCode: 401,
        error: ErrorCode.UNAUTHORIZED,
        message: 'Missing authorization header',
      })
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer' || !token) {
      throw new AppError({
        statusCode: 401,
        error: ErrorCode.UNAUTHORIZED,
        message: 'Invalid authorization format',
      })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new AppError({
        statusCode: 500,
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'JWT secret is not configured',
      })
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    if (!decoded.sub || !decoded.email) {
      throw new AppError({
        statusCode: 401,
        error: ErrorCode.UNAUTHORIZED,
        message: 'Invalid token payload',
      })
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
      return
    }

    next(
      new AppError({
        statusCode: 401,
        error: ErrorCode.UNAUTHORIZED,
        message: 'Invalid or expired token',
      }),
    )
  }
}