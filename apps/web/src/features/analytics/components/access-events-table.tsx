import { ExternalLink } from 'lucide-react'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { Button } from '../../../shared/components/ui/button'
import type { AnalyticsEventItem, AnalyticsEventsPagination } from '../types'

type AccessEventsTableProps = {
  events: AnalyticsEventItem[]
  pagination: AnalyticsEventsPagination
  onPageChange: (page: number) => void
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function displayValue(value: string | null) {
  return value?.trim() || 'Unknown'
}

export function AccessEventsTable({
  events,
  pagination,
  onPageChange,
}: AccessEventsTableProps) {
  if (!events.length) {
    return (
      <EmptyState
        title="No access events"
        description="Recent access events will appear after valid redirects."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">
          Latest access events
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="bg-background">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Accessed at
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                IP address
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                User agent
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Referer
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                className="border-b border-border last:border-b-0 hover:bg-muted"
                key={event.id}
              >
                <td className="px-4 py-3 font-mono text-xs text-foreground">
                  {formatDateTime(event.accessedAt)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {displayValue(event.ipAddress)}
                </td>
                <td className="max-w-96 px-4 py-3 text-sm text-muted-foreground">
                  <span className="line-clamp-2">
                    {displayValue(event.userAgent)}
                  </span>
                </td>
                <td className="max-w-72 px-4 py-3 text-sm text-muted-foreground">
                  {event.referer ? (
                    <a
                      className="inline-flex max-w-full items-center gap-2 truncate hover:text-foreground hover:underline"
                      href={event.referer}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="truncate">{event.referer}</span>
                      <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                    </a>
                  ) : (
                    'Unknown'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            size="sm"
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            size="sm"
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
