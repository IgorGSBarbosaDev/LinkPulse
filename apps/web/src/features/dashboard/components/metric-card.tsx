import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  icon: LucideIcon
  label: string
  value: number
}

export function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-[1.625rem] font-semibold leading-tight text-foreground">
            {new Intl.NumberFormat('en').format(value)}
          </span>
        </div>
        <span className="rounded-md border border-border bg-surface p-2 text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
    </div>
  )
}
