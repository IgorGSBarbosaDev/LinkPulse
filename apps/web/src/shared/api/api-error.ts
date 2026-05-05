import { AxiosError } from 'axios'

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_VERIFICATION_TOKEN'
  | 'VERIFICATION_TOKEN_EXPIRED'
  | 'VERIFICATION_TOKEN_ALREADY_USED'
  | 'VERIFICATION_TOKEN_REVOKED'

type ErrorPayload = {
  code?: string
  message?: string
  error?: string
}

export type ApiError = {
  code: ApiErrorCode
  message: string
  status?: number
}

const statusCodeMap: Record<number, ApiErrorCode> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'RATE_LIMITED',
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Check API connection and try again.',
      }
    }

    const payload = error.response.data as ErrorPayload | undefined
    const status = error.response.status

    return {
      code: (payload?.code as ApiErrorCode | undefined) ?? statusCodeMap[status] ?? 'UNKNOWN_ERROR',
      message:
        payload?.message ??
        payload?.error ??
        'Request failed. Please try again.',
      status,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unexpected error. Please try again.',
  }
}
