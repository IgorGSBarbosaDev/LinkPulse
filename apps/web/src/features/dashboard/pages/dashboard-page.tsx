import {
  Activity,
  CalendarClock,
  MousePointerClick,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ClicksByDayChart } from '../../analytics/components/clicks-by-day-chart'
import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { MetricCard } from '../components/metric-card'
import { RecentLinksTable } from '../components/recent-clicks-table'
import { TopLinksTable } from '../components/top-links-table'
import { useDashboard } from '../hooks/use-dashboard'
import type { DashboardRangePreset } from '../types'

const ranges: { label: string; value: DashboardRangePreset }[] = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
]

export function DashboardPage() {
  const [range, setRange] = useState<DashboardRangePreset>('3m')
  const dashboardQuery = useDashboard(range)
  const dashboard = dashboardQuery.data
  const totalLinks = dashboard?.summary.totalLinks ?? 0
  const activeLinks = dashboard?.summary.activeLinks ?? 0
  const activeUsagePercent =
    totalLinks > 0 ? Math.min(100, Math.round((activeLinks / totalLinks) * 100)) : 0

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of clicks, trends, active links, and recent activity."
    >
      <div className="flex flex-col gap-6">
        {dashboardQuery.isLoading ? (
          <LoadingState label="Loading dashboard" />
        ) : null}

        {dashboardQuery.isError ? (
          <ErrorState
            description={dashboardQuery.error.message}
            onRetry={() => {
              void dashboardQuery.refetch()
            }}
            title="Could not load dashboard"
          />
        ) : null}

        {dashboardQuery.isSuccess && dashboardQuery.data.summary.totalLinks === 0 ? (
          <EmptyState
            action={
              <Link to="/links/new">
                <Button size="sm" variant="primary">
                  Create first link
                </Button>
              </Link>
            }
            description="Create a short link to start collecting click analytics."
            title="No links yet"
          />
        ) : null}

        {dashboard ? (
          dashboard.summary.totalLinks > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={MousePointerClick}
                  label="Total clicks"
                  value={dashboard.summary.totalClicks}
                />
                <MetricCard
                  icon={Activity}
                  label="Clicks today"
                  value={dashboard.summary.clicksToday}
                />
                <MetricCard
                  icon={CalendarClock}
                  label="Last 7 days"
                  value={dashboard.summary.clicksLast7Days}
                />
                <div className="rounded-lg border border-border bg-card px-4 py-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                        Active links
                      </span>
                      <span className="font-mono text-[1.625rem] font-semibold leading-tight text-foreground">
                        {activeLinks}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {totalLinks} total links
                      </span>
                    </div>
                    <span className="rounded-md border border-border bg-surface p-2 text-muted-foreground">
                      <Activity aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full border border-border bg-background">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{ width: `${activeUsagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card" id="analytics">
                <div className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
                    Clicks by day
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {ranges.map((option) => (
                      <Button
                        className={range === option.value ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' : 'uppercase tracking-label'}
                        key={option.value}
                        onClick={() => setRange(option.value)}
                        size="sm"
                        variant="secondary"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <ClicksByDayChart
                    data={dashboard.clicksByDay}
                    title="Clicks trend"
                  />
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <TopLinksTable links={dashboard.topLinks} />
                <RecentLinksTable links={dashboard.recentLinks} />
              </div>
            </>
          ) : null
        ) : null}
      </div>
    </PageContainer>
  )
}
