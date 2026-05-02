import { BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { Button } from '../../../shared/components/ui/button'
import type { DashboardRecentEvent } from '../types'

type RecentClicksTableProps = {
  events: DashboardRecentEvent[]
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function RecentClicksTable({ events }: RecentClicksTableProps) {
  if (!events.length) {
    return (
      <EmptyState
        title="No recent activity"
        description="Recent access events will appear after valid redirects."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">
          Recent activity
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-background">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Link
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Accessed
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Referer
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                className="border-b border-border last:border-b-0 hover:bg-muted"
                key={event.id}
              >
                <td className="max-w-72 px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {event.title || event.shortCode}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {event.shortCode}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">
                  {formatDateTime(event.accessedAt)}
                </td>
                <td className="max-w-80 px-4 py-3 text-sm text-muted-foreground">
                  <span className="block truncate">
                    {event.referer || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/links/${event.linkId}/analytics`}>
                    <Button aria-label="View analytics" size="sm" variant="ghost">
                      <BarChart3 aria-hidden="true" className="size-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
