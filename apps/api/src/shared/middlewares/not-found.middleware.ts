import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error.js'
import { ErrorCode } from '../errors/error-codes.js'

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new AppError({
      statusCode: 404,
      error: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    }),
  )
}
