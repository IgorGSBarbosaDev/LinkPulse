import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'

type ForbiddenStateProps = {
  title?: string
  description?: string
  action?: ReactNode
}

export function ForbiddenState({
  title = 'Access denied',
  description = 'You do not have permission to access this content.',
  action,
}: ForbiddenStateProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 text-error" />
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
