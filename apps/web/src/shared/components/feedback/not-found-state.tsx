import { SearchX } from 'lucide-react'

export function NotFoundState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <SearchX aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">Not found</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Requested data was not found or was removed.
          </p>
        </div>
      </div>
    </div>
  )
}
