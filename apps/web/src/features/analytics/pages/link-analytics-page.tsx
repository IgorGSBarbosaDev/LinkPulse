import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { ForbiddenState } from '../../../shared/components/feedback/forbidden-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { NotFoundState } from '../../../shared/components/feedback/not-found-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { AccessEventsTable } from '../components/access-events-table'
import { AnalyticsSummaryCards } from '../components/analytics-summary-cards'
import { ClicksByDayChart } from '../components/clicks-by-day-chart'
import {
  useLinkAnalyticsEvents,
  useLinkAnalyticsSummary,
  useLinkClicksByDay,
} from '../hooks/use-link-analytics'
import { getDefaultDateRange } from '../utils/analytics-date-range'

const eventLimit = 10

export function LinkAnalyticsPage() {
  const { id } = useParams()
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange())
  const [eventsPage, setEventsPage] = useState(1)
  const summaryQuery = useLinkAnalyticsSummary(id)
  const clicksByDayQuery = useLinkClicksByDay(id, dateRange)
  const eventsQuery = useLinkAnalyticsEvents(id, {
    page: eventsPage,
    limit: eventLimit,
  })
  const blockingError = summaryQuery.error ?? null
  const errorCopy = toApiErrorCopy(blockingError, 'Could not load analytics')

  return (
    <PageContainer
      title="Link analytics"
      description="Track clicks, recent access events, and daily performance."
      actions={
        id ? (
          <div className="flex items-center gap-2">
            <Link to={`/links/${id}`}>
              <Button size="sm" variant="secondary">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Link details
              </Button>
            </Link>
            <Link to="/links">
              <Button size="sm" variant="ghost">
                Links
              </Button>
            </Link>
          </div>
        ) : null
      }
    >
      <div className="flex flex-col gap-5">
        {summaryQuery.isLoading ? <LoadingState label="Loading analytics" /> : null}

        {summaryQuery.isError && blockingError?.code === 'FORBIDDEN' ? (
          <ForbiddenState />
        ) : null}

        {summaryQuery.isError && blockingError?.code === 'NOT_FOUND' ? (
          <NotFoundState />
        ) : null}

        {summaryQuery.isError &&
        blockingError?.code !== 'FORBIDDEN' &&
        blockingError?.code !== 'NOT_FOUND' ? (
          <ErrorState
            description={errorCopy.description}
            onRetry={() => {
              void summaryQuery.refetch()
              void clicksByDayQuery.refetch()
              void eventsQuery.refetch()
            }}
            title={errorCopy.title}
          />
        ) : null}

        {summaryQuery.isSuccess ? (
          <>
            <AnalyticsSummaryCards summary={summaryQuery.data} />

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    Date range
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Query clicks by day with backend date filters.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      From
                    </span>
                    <input
                      className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                      onChange={(event) =>
                        setDateRange((current) => ({
                          ...current,
                          from: event.target.value,
                        }))
                      }
                      type="date"
                      value={dateRange.from}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      To
                    </span>
                    <input
                      className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                      onChange={(event) =>
                        setDateRange((current) => ({
                          ...current,
                          to: event.target.value,
                        }))
                      }
                      type="date"
                      value={dateRange.to}
                    />
                  </label>
                </div>
              </div>
            </div>

            {clicksByDayQuery.isLoading ? (
              <LoadingState label="Loading chart" />
            ) : null}

            {clicksByDayQuery.isError ? (
              <ErrorState
                description="Clicks by day could not be loaded."
                onRetry={() => {
                  void clicksByDayQuery.refetch()
                }}
                title="Could not load chart"
              />
            ) : null}

            {clicksByDayQuery.isSuccess ? (
              <ClicksByDayChart data={clicksByDayQuery.data} />
            ) : null}

            {eventsQuery.isLoading ? <LoadingState label="Loading events" /> : null}

            {eventsQuery.isError ? (
              <ErrorState
                description="Access events could not be loaded."
                onRetry={() => {
                  void eventsQuery.refetch()
                }}
                title="Could not load events"
              />
            ) : null}

            {eventsQuery.isSuccess ? (
              <AccessEventsTable
                events={eventsQuery.data.data}
                onPageChange={setEventsPage}
                pagination={eventsQuery.data.pagination}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </PageContainer>
  )
}
