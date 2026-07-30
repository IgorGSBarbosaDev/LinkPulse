import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError } from './app-error.js'
import { ErrorCode } from './error-codes.js'
import {
    sendRedirectErrorPage,
    shouldRenderRedirectErrorPage,
} from '../../modules/redirects/redirect-error-page.js'
import { logger } from '../observability/logger.js'

type ErrorResponse = {
    statusCode: number
    error: string
    message: string
    code?: string
    details:{
        field?: string
        message: string
     }[]
    requestId?: string | undefined
}

function getUniqueConstraintMessage(
    error: Prisma.PrismaClientKnownRequestError,
): string {
    const target = error.meta?.target
    const fields = Array.isArray(target)
        ? target.map((item) => String(item))
        : typeof target === 'string'
            ? [target]
            : []

    if (fields.some((field) => field.includes('customAlias'))) {
        return 'This alias is already in use.'
    }

    if (fields.some((field) => field.includes('shortCode'))) {
        return 'This short code is already in use.'
    }

    return 'Unique constraint violation'
}

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
): Response {
    void _next

    if (error instanceof AppError) {
        if (shouldRenderRedirectErrorPage(req)) {
            return sendRedirectErrorPage(req, res, error.statusCode)
        }

        const response: ErrorResponse = {
            statusCode: error.statusCode,
            error: error.error,
            message: error.message,
            details: error.details,
            requestId: (req as Request & { requestId?: string }).requestId,
        }

        if (error.code) {
            response.code = error.code
        }

        return res.status(error.statusCode).json(response)
    }
    if (error instanceof ZodError) {
        if (shouldRenderRedirectErrorPage(req)) {
            return sendRedirectErrorPage(req, res, 400)
        }

      return res.status(400).json({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid request data',
        details: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
        })),
        requestId: (req as Request & { requestId?: string }).requestId,
        })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      if (shouldRenderRedirectErrorPage(req)) {
        return sendRedirectErrorPage(req, res, 409)
      }

      return res.status(409).json({
        statusCode: 409,
        error: ErrorCode.CONFLICT,
        message: getUniqueConstraintMessage(error),
        code: 'CONFLICT',
        details: [],
        requestId: (req as Request & { requestId?: string }).requestId,
      })
    }

    if (error.code === 'P2025') {
        if (shouldRenderRedirectErrorPage(req)) {
            return sendRedirectErrorPage(req, res, 404)
        }

        return res.status(404).json({
            statusCode: 404,
            error: ErrorCode.NOT_FOUND,
            message: 'Resource not found',
            details: [],
            requestId: (req as Request & { requestId?: string }).requestId,
        })
    }
}
    logger.error('http.request.failed', {
        requestId: (req as Request & { requestId?: string }).requestId,
        method: req.method,
        path: req.originalUrl,
        error: error instanceof Error ? error.message : String(error),
    })

    if (shouldRenderRedirectErrorPage(req)) {
        return sendRedirectErrorPage(req, res, 500)
    }

    return res.status(500).json({
        statusCode: 500,
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected internal server error',
        details: [],
        requestId: (req as Request & { requestId?: string }).requestId,
    })
}
