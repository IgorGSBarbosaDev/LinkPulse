import type { ReactNode } from 'react'

import { EmptyState } from './empty-state'

type PlaceholderPanelProps = {
  title: string
  description: string
  children?: ReactNode
}

export function PlaceholderPanel({
  title,
  description,
  children,
}: PlaceholderPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <EmptyState title={title} description={description} />
      <aside className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Phase 1 scope</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Foundation route only. Data, forms, tables, charts, and mutations arrive
          in later phases.
        </p>
        {children ? <div className="mt-5">{children}</div> : null}
      </aside>
    </div>
  )
}
