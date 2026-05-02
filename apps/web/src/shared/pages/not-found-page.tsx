import { Link } from 'react-router-dom'

import { ErrorState } from '../components/feedback/error-state'

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-xl">
        <ErrorState
          title="Page not found"
          description="This route is not part of the LinkPulse frontend."
        />
        <Link
          className="mt-4 inline-flex rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          to="/"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
