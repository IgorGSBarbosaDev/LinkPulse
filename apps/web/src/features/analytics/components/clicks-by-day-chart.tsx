import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import type { ClicksByDayItem } from '../types'

type ClicksByDayChartProps = {
  data: ClicksByDayItem[]
  title?: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`))
}

export function ClicksByDayChart({
  data,
  title = 'Clicks by day',
}: ClicksByDayChartProps) {
  const hasClicks = data.some((item) => item.clicks > 0)

  if (!data.length || !hasClicks) {
    return (
      <EmptyState
        title="No clicks yet"
        description="Chart will appear after this link receives tracked clicks."
      />
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Daily tracked clicks for selected range.
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ bottom: 0, left: 0, right: 8, top: 8 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={formatDate}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                color: 'hsl(var(--foreground))',
              }}
              labelFormatter={(value) => formatDate(String(value))}
            />
            <Area
              dataKey="clicks"
              fill="hsl(var(--foreground))"
              fillOpacity={0.16}
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
