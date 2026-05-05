import { MailCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/components/ui/button'
import { useEmailVerification } from '../hooks/use-email-verification'

type LocationState = {
  email?: string
}

export function EmailVerificationSentPage() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const email = state?.email ?? ''
  const { isResendingVerificationEmail, resendVerificationEmailAsync } =
    useEmailVerification()

  async function handleResend() {
    if (!email) {
      toast.error('Enter your email on login to request a new link.')
      return
    }

    try {
      await resendVerificationEmailAsync({ email })
      toast.success('Verification email sent.')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message)
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
              <MailCheck aria-hidden="true" className="size-5 text-foreground" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[2rem] font-semibold leading-tight">
                Check your email
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Validar email cadastrado. Favor olhar sua caixa de entrada.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Also check spam if the message does not arrive.
              </p>
            </div>
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
          <div className="mt-6 border-t border-border pt-4">
            <Link
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              to="/login"
            >
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
