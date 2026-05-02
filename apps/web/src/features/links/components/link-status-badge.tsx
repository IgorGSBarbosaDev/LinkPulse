import { cn } from '../../../shared/lib/utils'
import type { LinkListItem } from '../types'

type LinkStatusBadgeProps = {
  link: LinkListItem
}

export function LinkStatusBadge({ link }: LinkStatusBadgeProps) {
  const label = !link.active ? 'Inactive' : link.expired ? 'Expired' : 'Active'

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md border px-2 font-mono text-xs uppercase tracking-label',
        link.active && !link.expired
          ? 'border-primary bg-surface text-foreground'
          : 'border-border bg-background text-muted-foreground',
        link.expired && 'line-through',
      )}
    >
      {label}
    </span>
  )
}
