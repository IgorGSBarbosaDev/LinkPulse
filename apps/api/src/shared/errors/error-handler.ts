import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError } from './app-error.js'
import { ErrorCode } from './error-codes.js'
import {
    sendRedirectErrorPage,
    shouldRenderRedirectErrorPage,
} from '../../modules/redirects/redirect-error-page.js'

type ErrorResponse = {
    statusCode: number
    error: string
    message: string
    code?: string
    details:{
        field?: string
        message: string
     }[]
}

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
): Response {
    if (error instanceof AppError) {
        if (shouldRenderRedirectErrorPage(req)) {
            return sendRedirectErrorPage(req, res, error.statusCode)
        }

        const response: ErrorResponse = {
            statusCode: error.statusCode,
            error: error.error,
            message: error.message,
            details: error.details,
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
        message: 'Unique constraint violation',
        code: 'CONFLICT',
        details: [],
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
        })
    }
}
    if (process.env.NODE_ENV !== 'production') {
        console.error(error)
    }

    if (shouldRenderRedirectErrorPage(req)) {
        return sendRedirectErrorPage(req, res, 500)
    }

    return res.status(500).json({
        statusCode: 500,
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected internal server error',
        details: [],
    })
}
