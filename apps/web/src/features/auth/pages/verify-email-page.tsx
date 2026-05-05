import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import type { ApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/components/ui/button'
import { useEmailVerification } from '../hooks/use-email-verification'

type VerifyState = 'idle' | 'verifying' | 'success' | 'error'

function getErrorMessage(error: ApiError | null) {
  if (!error) {
    return 'Verification failed. Please try again.'
  }

  if (error.code === 'VERIFICATION_TOKEN_EXPIRED') {
    return 'Verification token expired.'
  }

  if (error.code === 'VERIFICATION_TOKEN_ALREADY_USED') {
    return 'Verification token has already been used.'
  }

  if (error.code === 'VERIFICATION_TOKEN_REVOKED') {
    return 'Verification token has been revoked.'
  }

  if (error.code === 'INVALID_VERIFICATION_TOKEN') {
    return 'Verification link is invalid.'
  }

  return error.message
}

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

  useEffect(() => {
    let cancelled = false

    async function verify() {
      if (!token) {
        setState('error')
        setMessage('Verification link is invalid.')
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
          setMessage(getErrorMessage(apiError))
          setErrorCode(apiError.code)
          setState('error')
        }
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [token, verifyEmailAsync])

  const isSuccess = state === 'success'
  const title = isSuccess ? 'Email verified' : 'Email verification'
  const displayMessage =
    state === 'verifying' ? 'Verifying your email...' : message
  const canResend = errorCode === 'VERIFICATION_TOKEN_EXPIRED'

  async function handleResend() {
    try {
      await resendVerificationEmailAsync({ email })
      setMessage(
        'If this email is registered and not verified, a new verification link will be sent.',
      )
    } catch (error) {
      setMessage((error as ApiError).message)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-surface px-5 py-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-label text-muted-foreground">
            LinkPulse
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex size-11 items-center justify-center rounded-md border border-border bg-background">
              {isSuccess ? (
                <CheckCircle2
                  aria-hidden="true"
                  className="size-5 text-foreground"
                />
              ) : (
                <XCircle aria-hidden="true" className="size-5 text-error" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[2rem] font-semibold leading-tight">
                {title}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {displayMessage || getErrorMessage(verifyEmailError)}
              </p>
            </div>
            {canResend ? (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium uppercase tracking-label text-muted-foreground" htmlFor="verification-email">
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
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-medium uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/90"
              to="/login"
            >
              Go to login
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
