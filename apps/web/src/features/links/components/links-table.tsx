import {
  Activity,
  BarChart3,
  Edit3,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import type { LinkListItem } from '../types'
import { CopyShortUrlButton } from './copy-short-url-button'
import { LinkStatusBadge } from './link-status-badge'
import { Button } from '../../../shared/components/ui/button'

type LinksTableProps = {
  links: LinkListItem[]
}

function getDisplayTitle(link: LinkListItem) {
  return link.title || link.shortCode
}

export function LinksTable({
  links,
}: LinksTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-surface px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
          Links management
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Link
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Short link
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Clicks
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                className="border-b border-border transition-colors last:border-b-0 hover:bg-surface"
                key={link.id}
              >
                <td className="max-w-48 px-4 py-2.5 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {getDisplayTitle(link)}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {link.shortCode}
                    </span>
                  </div>
                </td>
                <td className="max-w-56 px-4 py-2.5 align-top">
                  <a
                    className="block truncate font-mono text-xs text-foreground hover:text-primary hover:underline"
                    href={link.shortUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.shortUrl}
                  </a>
                </td>
                <td className="px-4 py-2.5 align-top">
                  <LinkStatusBadge link={link} />
                </td>
                <td className="px-4 py-2.5 align-top">
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground">
                    <Activity aria-hidden="true" className="size-4 text-muted-foreground" />
                    {link.clickCount}
                  </span>
                </td>
                <td className="px-4 py-2.5 align-top">
                  <div className="flex items-center gap-1 rounded-md border border-border bg-background px-1 py-0.5">
                    <Link to={`/links/${link.id}/edit`}>
                      <Button aria-label="Edit link" size="sm" variant="ghost">
                        <Edit3 aria-hidden="true" className="size-4" />
                      </Button>
                    </Link>
                    <CopyShortUrlButton shortUrl={link.shortUrl} />
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
