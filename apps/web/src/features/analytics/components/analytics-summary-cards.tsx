import { Activity, CalendarClock, Clock3, MousePointerClick } from 'lucide-react'

import type { AnalyticsSummary } from '../types'

type AnalyticsSummaryCardsProps = {
  summary: AnalyticsSummary
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value)
}

function formatLastAccess(value: string | null) {
  if (!value) {
    return 'Never'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-2xl font-semibold text-foreground">
            {value}
          </span>
        </div>
        <span className="rounded-md border border-border bg-background p-2 text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
    </div>
  )
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={MousePointerClick}
        label="Total clicks"
        value={formatNumber(summary.totalClicks)}
      />
      <SummaryCard
        icon={Activity}
        label="Clicks today"
        value={formatNumber(summary.clicksToday)}
      />
      <SummaryCard
        icon={CalendarClock}
        label="Last 7 days"
        value={formatNumber(summary.clicksLast7Days)}
      />
      <SummaryCard
        icon={Clock3}
        label="Last access"
        value={formatLastAccess(summary.lastAccessAt)}
      />
    </div>
  )
}
