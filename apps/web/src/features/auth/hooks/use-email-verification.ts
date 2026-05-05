import { useMutation } from '@tanstack/react-query'

import type { ApiError } from '../../../shared/api/api-error'
import {
  resendVerificationEmail,
  verifyEmail,
} from '../api/auth-api'
import type {
  MessageResponse,
  ResendVerificationEmailRequest,
  VerifyEmailRequest,
} from '../types'

export function useEmailVerification() {
  const verifyEmailMutation = useMutation<
    MessageResponse,
    ApiError,
    VerifyEmailRequest
  >({
    mutationFn: verifyEmail,
  })

  const resendVerificationEmailMutation = useMutation<
    MessageResponse,
    ApiError,
    ResendVerificationEmailRequest
  >({
    mutationFn: resendVerificationEmail,
  })

  return {
    verifyEmailAsync: verifyEmailMutation.mutateAsync,
    verifyEmailError: verifyEmailMutation.error ?? null,
    isVerifyingEmail: verifyEmailMutation.isPending,
    resendVerificationEmailAsync:
      resendVerificationEmailMutation.mutateAsync,
    resendVerificationEmailError:
      resendVerificationEmailMutation.error ?? null,
    isResendingVerificationEmail:
      resendVerificationEmailMutation.isPending,
  }
}
