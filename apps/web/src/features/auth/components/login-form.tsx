import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { useAuth } from '../hooks/use-auth'
import { loginSchema, type LoginFormValues } from '../schemas/auth-schemas'

type LocationState = {
  from?: {
    pathname?: string
  }
}

const inputClasses =
  'h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

export function LoginForm() {
  const { isLoggingIn, loginAsync } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const returnPath = state?.from?.pathname ?? '/dashboard'

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginAsync(values)
      navigate(returnPath, { replace: true })
    } catch (error) {
      const apiError = error as ApiError
      setError('root', { message: apiError.message })
      toast.error(apiError.message)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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
        <div className="rounded-md border border-border bg-background p-3 text-sm text-error">
          {errors.root.message}
        </div>
      ) : null}

      <Button disabled={isLoggingIn} type="submit" variant="primary">
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
