import { Link } from 'react-router-dom'

import { RegisterForm } from '../components/register-form'

export function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm font-semibold">LinkPulse</p>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Create a workspace login for short links and analytics.
          </p>
        </div>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            to="/"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  )
}
