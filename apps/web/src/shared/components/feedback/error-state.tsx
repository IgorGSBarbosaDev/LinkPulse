import { AlertTriangle } from 'lucide-react'

import { Button } from '../ui/button'

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The request could not be completed. Try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-error" />
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {onRetry ? (
          <Button onClick={onRetry} size="sm" variant="secondary">
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  )
}
