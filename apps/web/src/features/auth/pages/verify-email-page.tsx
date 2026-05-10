import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import type { ApiError } from '../../../shared/api/api-error'
import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { PublicFeedbackPage } from '../../../shared/components/feedback/public-feedback-page'
import { Button } from '../../../shared/components/ui/button'
import { useEmailVerification } from '../hooks/use-email-verification'

type VerifyState = 'idle' | 'verifying' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const {
    isResendingVerificationEmail,
    resendVerificationEmailAsync,
    verifyEmailAsync,
    verifyEmailError,
  } = useEmailVerification()
  const [state, setState] = useState<VerifyState>('idle')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [errorCode, setErrorCode] = useState<ApiError['code'] | null>(null)

  async function runVerification(cancelled = false) {
    if (!token) {
      setState('error')
      setMessage(
        'This verification link cannot be used. Request a new verification email and try again.',
      )
      setErrorCode('INVALID_VERIFICATION_TOKEN')
      return
    }

    setState('verifying')
    setErrorCode(null)

    try {
      const response = await verifyEmailAsync({ token })

      if (!cancelled) {
        setMessage(response.message)
        setState('success')
      }
    } catch (error) {
      if (!cancelled) {
        const apiError = error as ApiError
        setMessage(toApiErrorCopy(apiError, 'Email verification failed').description)
        setErrorCode(apiError.code)
        setState('error')
      }
    }
  }

  useEffect(() => {
    let cancelled = false

    void runVerification(cancelled)

    return () => {
      cancelled = true
    }
    // verifyEmailAsync is stable enough for this route effect; including it can retrigger after mutation state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const isSuccess = state === 'success'
  const isVerifying = state === 'verifying'
  const title = isSuccess
    ? 'Email verified'
    : isVerifying
      ? 'Verifying email'
      : 'Email verification'
  const displayMessage =
    state === 'verifying' ? 'Verifying your email...' : message
  const canResend =
    errorCode === 'VERIFICATION_TOKEN_EXPIRED' ||
    errorCode === 'VERIFICATION_TOKEN_REVOKED'
  const canRetry =
    errorCode === 'NETWORK_ERROR' ||
    errorCode === 'UNKNOWN_ERROR' ||
    errorCode === 'RATE_LIMITED'

  async function handleResend() {
    try {
      const response = await resendVerificationEmailAsync({ email })
      setMessage(response.message)
    } catch (error) {
      const apiError = error as ApiError
      setMessage(toApiErrorCopy(apiError, 'Could not resend verification email').description)
    }
  }

  return (
    <PublicFeedbackPage
      description={
        <p>
          {displayMessage ||
            toApiErrorCopy(verifyEmailError, 'Email verification failed').description}
        </p>
      }
      footer={null}
      icon={isSuccess ? CheckCircle2 : isVerifying ? LoaderCircle : XCircle}
      title={title}
      tone={isSuccess ? 'success' : isVerifying ? 'neutral' : 'error'}
    >
      <div className="flex flex-col gap-4">
        {canResend ? (
          <div className="flex flex-col gap-3">
            <label
              className="text-xs font-medium uppercase tracking-label text-muted-foreground"
              htmlFor="verification-email"
            >
              Email
            </label>
            <input
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
              id="verification-email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
            <Button
              disabled={isResendingVerificationEmail || !email}
              onClick={handleResend}
              type="button"
              variant="secondary"
            >
              {isResendingVerificationEmail
                ? 'Sending...'
                : 'Resend verification email'}
            </Button>
          </div>
        ) : null}
        {canRetry ? (
          <Button
            className="uppercase tracking-label"
            onClick={() => void runVerification()}
            type="button"
            variant="secondary"
          >
            Try again
          </Button>
        ) : null}
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-medium uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/90"
          to="/login"
        >
          Go to login
        </Link>
      </div>
    </PublicFeedbackPage>
  )
}
