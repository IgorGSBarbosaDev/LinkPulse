export const ErrorCode = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  GONE: 'Gone',
  TOO_MANY_REQUESTS: 'Too Many Requests',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

/*
should use:
throw new AppError({
  statusCode: 409,
  error: ErrorCode.CONFLICT,
  message: 'Email already registered',
})
*/