import { BarChart3, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { Button } from '../../../shared/components/ui/button'
import type { TopLinkItem } from '../../analytics/types'

type TopLinksTableProps = {
  links: TopLinkItem[]
}

export function TopLinksTable({ links }: TopLinksTableProps) {
  if (!links.length) {
    return (
      <EmptyState
        title="No top links yet"
        description="Top links will appear after redirects generate clicks."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">Top links</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead className="bg-background">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Link
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Clicks
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                className="border-b border-border last:border-b-0 hover:bg-muted"
                key={link.id}
              >
                <td className="max-w-96 px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {link.title || link.shortCode}
                    </span>
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {link.shortUrl}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-foreground">
                  {new Intl.NumberFormat('en').format(link.clickCount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link to={`/links/${link.id}`}>
                      <Button aria-label="View details" size="sm" variant="ghost">
                        <Eye aria-hidden="true" className="size-4" />
                      </Button>
                    </Link>
                    <Link to={`/links/${link.id}/analytics`}>
                      <Button aria-label="View analytics" size="sm" variant="ghost">
                        <BarChart3 aria-hidden="true" className="size-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
