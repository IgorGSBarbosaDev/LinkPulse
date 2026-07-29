import type { ApiError } from './api-error'

type ApiErrorCopy = {
  title: string
  description: string
}

export function toApiErrorCopy(
  error: ApiError | null | undefined,
  fallbackTitle: string,
): ApiErrorCopy {
  if (!error) {
    return {
      title: fallbackTitle,
      description: 'Request failed. Please try again.',
    }
  }

  if (error.code === 'FORBIDDEN') {
    return {
      title: 'Access denied',
      description: 'You do not have permission to access this resource.',
    }
  }

  if (error.code === 'UNAUTHORIZED') {
    return {
      title: 'Session required',
      description: 'Sign in again to continue.',
    }
  }

  if (error.code === 'NOT_FOUND') {
    return {
      title: 'Not found',
      description: 'Requested resource was not found.',
    }
  }

  if (error.code === 'CONFLICT') {
    return {
      title: fallbackTitle,
      description: error.message || 'This action conflicts with existing data.',
    }
  }

  if (error.code === 'GONE') {
    return {
      title: 'No longer available',
      description: error.message || 'This resource is no longer available.',
    }
  }

  if (error.code === 'RATE_LIMITED') {
    return {
      title: 'Too many requests',
      description: 'You reached request limit. Wait a moment and try again.',
    }
  }

  if (error.code === 'NETWORK_ERROR') {
    return {
      title: 'Network error',
      description: 'Could not reach API. Check connection and try again.',
    }
  }

  if (error.code === 'VALIDATION_ERROR') {
    return {
      title: fallbackTitle,
      description: 'Validation failed. Review input and try again.',
    }
  }

  return {
    title: fallbackTitle,
    description: error.message || 'Request failed. Please try again.',
  }
}
