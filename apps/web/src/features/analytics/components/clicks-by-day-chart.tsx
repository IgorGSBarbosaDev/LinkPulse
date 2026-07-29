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
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-surface px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
          {title}
        </h2>
      </div>
      <div className="px-4 pb-3 pt-3">
        <p className="text-sm text-muted-foreground">
          Daily tracked clicks for selected range.
        </p>
      </div>
      <div className="h-72 px-2 pb-2">
        <ResponsiveContainer
          height="100%"
          initialDimension={{ height: 280, width: 320 }}
          minHeight={240}
          minWidth={300}
          width="100%"
        >
          <AreaChart data={data} margin={{ bottom: 0, left: 6, right: 8, top: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={formatDate}
              tickLine={false}
              tickMargin={10}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                color: 'var(--color-foreground)',
              }}
              labelFormatter={(value) => formatDate(String(value))}
            />
            <Area
              dataKey="clicks"
              fill="var(--color-foreground)"
              fillOpacity={0.14}
              stroke="var(--color-foreground)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
