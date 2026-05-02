import { Link } from 'react-router-dom'

import { env } from '../../../shared/lib/env'

export function LandingPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-content flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex h-14 items-center justify-between border-b border-border">
          <span className="font-mono text-sm font-semibold tracking-wide">
            {env.appName}
          </span>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-md px-3 py-2 text-xs font-medium uppercase tracking-label text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="rounded-md bg-primary px-3 py-2 text-xs font-medium uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/90"
              to="/register"
            >
              Register
            </Link>
          </div>
        </nav>
        <div className="grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="flex max-w-3xl flex-col gap-5">
            <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
              Short links + analytics
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-foreground">
              LinkPulse
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              MVP app shell is ready for auth, link management, redirects, and
              analytics implementation.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="font-mono text-sm text-foreground">/dashboard</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Private product routes are protected and prepared for feature work.
            </p>
          </div>
        </div>
        <div className="border-t border-border py-4 text-xs text-muted-foreground">
          Monolith Dark foundation from Stitch design system.
        </div>
      </section>
    </main>
  )
}
