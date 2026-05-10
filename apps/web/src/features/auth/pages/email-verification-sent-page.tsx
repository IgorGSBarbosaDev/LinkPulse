import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { PublicFeedbackPage } from '../../../shared/components/feedback/public-feedback-page'
import { Button } from '../../../shared/components/ui/button'
import { useEmailVerification } from '../hooks/use-email-verification'

type LocationState = {
  email?: string
}

export function EmailVerificationSentPage() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const [email, setEmail] = useState(state?.email ?? '')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { isResendingVerificationEmail, resendVerificationEmailAsync } =
    useEmailVerification()

  async function handleResend() {
    if (!email) {
      setErrorMessage('Enter your email to request a new verification link.')
      return
    }

    try {
      const response = await resendVerificationEmailAsync({ email })
      setErrorMessage('')
      setStatusMessage(response.message)
      toast.success('Verification email sent.')
    } catch (error) {
      const apiError = error as ApiError
      const copy = toApiErrorCopy(apiError, 'Could not resend verification email')

      setStatusMessage('')
      setErrorMessage(
        apiError.code === 'RATE_LIMITED'
          ? 'You reached the resend limit. Wait a moment before requesting another link.'
          : copy.description,
      )
      toast.error(apiError.message)
    }
  }

  return (
    <PublicFeedbackPage
      description={
        <div className="flex flex-col gap-2">
          <p>
            {email
              ? `We sent a verification link to ${email}.`
              : 'We sent a verification link to the email used during registration.'}
          </p>
          <p>Check your inbox and spam folder to finish creating your account.</p>
        </div>
      }
      footer={
        <Link
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          to="/login"
        >
          Back to login
        </Link>
      }
      icon={MailCheck}
      title="Check your email"
      tone="success"
    >
      <div className="flex flex-col gap-3">
        {!state?.email ? (
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-label text-muted-foreground"
              htmlFor="verification-email"
            >
              Email
            </label>
            <input
              autoComplete="email"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
              id="verification-email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>
        ) : null}
        {statusMessage ? (
          <p className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
            {statusMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-md border border-border bg-background p-3 text-sm text-error">
            {errorMessage}
          </p>
        ) : null}
        <Button
          className="uppercase tracking-label"
          disabled={isResendingVerificationEmail || !email}
          onClick={handleResend}
          variant="secondary"
        >
          {isResendingVerificationEmail
            ? 'Sending...'
            : 'Resend verification email'}
        </Button>
      </div>
    </PublicFeedbackPage>
  )
}
