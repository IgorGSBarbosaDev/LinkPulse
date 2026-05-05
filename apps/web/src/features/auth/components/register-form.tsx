import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { useAuth } from '../hooks/use-auth'
import { registerSchema, type RegisterFormValues } from '../schemas/auth-schemas'

const inputClasses =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

export function RegisterForm() {
  const { isRegistering, registerAsync } = useAuth()
  const navigate = useNavigate()

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerAsync(values)
      navigate('/email-verification-sent', {
        replace: true,
        state: { email: values.email },
      })
    } catch (error) {
      const apiError = error as ApiError
      setError('root', { message: apiError.message })
      toast.error(apiError.message)
    }
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-label text-muted-foreground" htmlFor="name">
          Name
        </label>
        <input
          autoComplete="name"
          className={cn(inputClasses, errors.name && 'border-error')}
          id="name"
          type="text"
          {...register('name')}
        />
        {errors.name ? (
          <p className="text-sm text-error">{errors.name.message}</p>
        ) : null}
      </div>

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
          autoComplete="new-password"
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

      <Button className="uppercase tracking-label" disabled={isRegistering} type="submit" variant="primary">
        {isRegistering ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link className="text-foreground hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  )
}
