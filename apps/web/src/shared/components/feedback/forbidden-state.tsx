import { ShieldAlert } from 'lucide-react'

export function ForbiddenState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 text-error" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">Access denied</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            You do not have permission to access this content.
          </p>
        </div>
      </div>
    </div>
  )
}
