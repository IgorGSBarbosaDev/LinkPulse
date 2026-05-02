import {
  Activity,
  CalendarClock,
  Link as LinkIcon,
  MousePointerClick,
  TimerOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { ClicksByDayChart } from '../../analytics/components/clicks-by-day-chart'
import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { MetricCard } from '../components/metric-card'
import { RecentClicksTable } from '../components/recent-clicks-table'
import { TopLinksTable } from '../components/top-links-table'
import { useDashboard } from '../hooks/use-dashboard'

export function DashboardPage() {
  const dashboardQuery = useDashboard()
  const dashboard = dashboardQuery.data

  return (
    <PageContainer
      title="Dashboard"
      description="Portfolio-wide link performance from real API data."
      actions={
        <Link to="/links/new">
          <Button size="sm" variant="primary">
            New link
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
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

        {dashboardQuery.isSuccess && dashboardQuery.data.links.length === 0 ? (
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
          dashboard.links.length > 0 ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  icon={LinkIcon}
                  label="Total links"
                  value={dashboard.summary.totalLinks}
                />
                <MetricCard
                  icon={MousePointerClick}
                  label="Total clicks"
                  value={dashboard.summary.totalClicks}
                />
                <MetricCard
                  icon={Activity}
                  label="Active links"
                  value={dashboard.summary.activeLinks}
                />
                <MetricCard
                  icon={TimerOff}
                  label="Expired links"
                  value={dashboard.summary.expiredLinks}
                />
                <MetricCard
                  icon={CalendarClock}
                  label="Last 7 days"
                  value={dashboard.summary.clicksLast7Days}
                />
              </div>

              <ClicksByDayChart
                data={dashboard.clicksByDay}
                title="All links clicks by day"
              />

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
                <RecentClicksTable events={dashboard.recentEvents} />
                <TopLinksTable links={dashboard.topLinks} />
              </div>
            </>
          ) : null
        ) : null}
      </div>
    </PageContainer>
  )
}
