import { ErrorCode } from './error-codes.js'

export type ErrorDetail = {
  field?: string
  message: string
}

export type AppErrorParams = {
  statusCode: number
  error: ErrorCode
  message: string
  details?: ErrorDetail[]
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly error: ErrorCode
  public readonly details: ErrorDetail[]

  constructor(params: AppErrorParams) {
    super(params.message)

    this.name = 'AppError'
    this.statusCode = params.statusCode
    this.error = params.error
    this.details = params.details ?? []

    Error.captureStackTrace?.(this, this.constructor)
  }

  private static create(
    statusCode: number,
    error: ErrorCode,
    message: string,
    details?: ErrorDetail[],
  ): AppError {
    const params: AppErrorParams = {
      statusCode,
      error,
      message,
    }

    if (details !== undefined) {
      params.details = details
    }

    return new AppError(params)
  }

  static badRequest(
    message = 'Invalid request data.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      400,
      ErrorCode.BAD_REQUEST,
      message,
      details,
    )
  }

  static validation(details: ErrorDetail[]): AppError {
    return AppError.badRequest('Invalid request data.', details)
  }

  static unauthorized(
    message = 'Authentication is required.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      401,
      ErrorCode.UNAUTHORIZED,
      message,
      details,
    )
  }

  static forbidden(
    message = 'You do not have permission to access this resource.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      403,
      ErrorCode.FORBIDDEN,
      message,
      details,
    )
  }

  static notFound(
    message = 'Resource not found.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      404,
      ErrorCode.NOT_FOUND,
      message,
      details,
    )
  }

  static conflict(
    message = 'Resource conflict.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      409,
      ErrorCode.CONFLICT,
      message,
      details,
    )
  }

  static gone(
    message = 'Resource is no longer available.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      410,
      ErrorCode.GONE,
      message,
      details,
    )
  }

  static tooManyRequests(
    message = 'Too many requests. Please try again later.',
    details?: ErrorDetail[],
  ): AppError {
    return AppError.create(
      429,
      ErrorCode.TOO_MANY_REQUESTS,
      message,
      details,
    )
  }

  static internal(message = 'Internal server error.'): AppError {
    return AppError.create(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      message,
    )
  }
}