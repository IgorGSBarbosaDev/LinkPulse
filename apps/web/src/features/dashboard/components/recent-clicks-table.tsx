import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { Button } from '../../../shared/components/ui/button'
import type { DashboardRecentLink } from '../types'

type RecentLinksTableProps = {
  links: DashboardRecentLink[]
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function RecentLinksTable({ links }: RecentLinksTableProps) {
  if (!links.length) {
    return (
      <EmptyState
        title="No recent links"
        description="Recently accessed links will appear after valid redirects."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
          Recent links
        </h2>
        <Link to="/links">
          <Button size="sm" variant="ghost">
            View all
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Link
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Short URL
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Last accessed
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Clicks
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                className="border-b border-border last:border-b-0 hover:bg-surface"
                key={link.linkId}
              >
                <td className="max-w-72 px-4 py-2.5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {link.title || link.shortCode}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {link.shortCode}
                    </span>
                  </div>
                </td>
                <td className="max-w-72 px-4 py-2.5">
                  <a
                    className="block truncate font-mono text-xs text-foreground hover:text-primary hover:underline"
                    href={link.shortUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.shortUrl}
                  </a>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                  {formatDateTime(link.lastAccessAt)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      link.active
                        ? 'inline-flex h-6 items-center rounded-md border border-primary bg-surface px-2 font-mono text-xs uppercase tracking-label text-foreground'
                        : 'inline-flex h-6 items-center rounded-md border border-border bg-background px-2 font-mono text-xs uppercase tracking-label text-muted-foreground'
                    }
                  >
                    {link.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-sm text-foreground">
                  {new Intl.NumberFormat('en').format(link.clickCount)}
                </td>
                <td className="px-4 py-2.5">
                  <Link to={`/links/${link.linkId}`}>
                    <Button aria-label="View link details" size="sm" variant="ghost">
                      <Eye aria-hidden="true" className="size-4" />
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
