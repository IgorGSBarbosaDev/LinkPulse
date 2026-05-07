import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { useEmailVerification } from '../hooks/use-email-verification'
import { useAuth } from '../hooks/use-auth'
import { loginSchema, type LoginFormValues } from '../schemas/auth-schemas'

type LocationState = {
  from?: {
    pathname?: string
  }
}

const inputClasses =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

export function LoginForm() {
  const { isLoggingIn, loginAsync } = useAuth()
  const { isResendingVerificationEmail, resendVerificationEmailAsync } =
    useEmailVerification()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const returnPath = state?.from?.pathname ?? '/dashboard'
  const [rootErrorCode, setRootErrorCode] = useState<ApiError['code'] | null>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    control,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const currentEmail = useWatch({ control, name: 'email' })
  const isEmailNotVerified = rootErrorCode === 'EMAIL_NOT_VERIFIED'

  async function onSubmit(values: LoginFormValues) {
    try {
      setRootErrorCode(null)
      await loginAsync(values)
      navigate(returnPath, { replace: true })
    } catch (error) {
      const apiError = error as ApiError
      const message =
        apiError.code === 'EMAIL_NOT_VERIFIED'
          ? toApiErrorCopy(apiError, 'Email verification required').description
          : apiError.message
      setRootErrorCode(apiError.code)
      setError('root', { message })
      toast.error(apiError.message)
    }
  }

  async function handleResendVerificationEmail() {
    try {
      await resendVerificationEmailAsync({ email: currentEmail })
      toast.success('Verification email sent.')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message)
    }
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-label text-muted-foreground" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className={cn(inputClasses, errors.email && 'border-error')}
          id="email"
          type="email"
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-sm text-error">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-label text-muted-foreground" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className={cn(inputClasses, errors.password && 'border-error')}
          id="password"
          type="password"
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-error">{errors.password.message}</p>
        ) : null}
      </div>

      {errors.root ? (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3 text-sm text-error">
          <p>{errors.root.message}</p>
          {isEmailNotVerified ? (
            <Button
              disabled={isResendingVerificationEmail || !currentEmail}
              onClick={handleResendVerificationEmail}
              size="sm"
              type="button"
              variant="secondary"
            >
              {isResendingVerificationEmail
                ? 'Sending...'
                : 'Resend verification email'}
            </Button>
          ) : null}
        </div>
      ) : null}

      <Button className="uppercase tracking-label" disabled={isLoggingIn} type="submit" variant="primary">
        {isLoggingIn ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link className="text-foreground hover:underline" to="/register">
          Create one
        </Link>
      </p>
    </form>
  )
}
