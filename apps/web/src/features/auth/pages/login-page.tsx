import { Link } from 'react-router-dom'

import { LoginForm } from '../components/login-form'

export function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-surface px-5 py-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-label text-muted-foreground">
            LinkPulse
          </p>
        </div>
        <div className="p-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-[2rem] font-semibold leading-tight">Login</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in with your email and password to manage links and analytics.
          </p>
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            to="/"
          >
            Back home
          </Link>
        </div>
        </div>
      </section>
    </main>
  )
}
