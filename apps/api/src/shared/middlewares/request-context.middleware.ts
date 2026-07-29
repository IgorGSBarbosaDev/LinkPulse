import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { logger } from '../observability/logger.js'

export type RequestWithId = Request & { requestId: string }

function getRequestId(req: Request): string {
  const provided = req.header('x-request-id')

  if (provided && /^[a-zA-Z0-9._:-]{1,128}$/.test(provided)) {
    return provided
  }

  return randomUUID()
}

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = getRequestId(req)
  const startedAt = Date.now()
  const request = req as RequestWithId

  request.requestId = requestId
  res.setHeader('X-Request-Id', requestId)
  res.on('finish', () => {
    logger.info('http.request.completed', {
      requestId,
      method: req.method,
      path: request.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    })
  })

  next()
}
