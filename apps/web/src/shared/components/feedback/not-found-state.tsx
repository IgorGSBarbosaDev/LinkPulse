import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

type NotFoundStateProps = {
  title?: string
  description?: string
  action?: ReactNode
}

export function NotFoundState({
  title = 'Not found',
  description = 'Requested data was not found or was removed.',
  action,
}: NotFoundStateProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <SearchX aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}
