import type {NextFunction, Request, Reponse } from 'express'
import { AppError } from '../errors/app-error.ts'
import { ErrorCode } from '../errors/error-codes.ts'

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