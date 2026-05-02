import {
  Activity,
  BarChart3,
  Edit3,
  Eye,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../../shared/components/ui/button'
import type { LinkListItem } from '../types'
import { CopyShortUrlButton } from './copy-short-url-button'
import { DeleteLinkDialog } from './delete-link-dialog'
import { LinkStatusBadge } from './link-status-badge'

type LinksTableProps = {
  links: LinkListItem[]
  isMutating: boolean
  onActivate: (linkId: string) => void
  onDeactivate: (linkId: string) => void
  onDelete: (linkId: string) => void
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No expiration'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function getDisplayTitle(link: LinkListItem) {
  return link.title || link.shortCode
}

export function LinksTable({
  links,
  isMutating,
  onActivate,
  onDeactivate,
  onDelete,
}: LinksTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-surface">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Short link
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Original URL
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Clicks
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Expiration
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-label text-muted-foreground">
                Created
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
                    className="block truncate font-mono text-xs text-foreground hover:underline"
                    href={link.shortUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.shortUrl}
                  </a>
                </td>
                <td className="max-w-72 px-4 py-2.5 align-top">
                  <a
                    className="block truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
                    href={link.originalUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.originalUrl}
                  </a>
                </td>
                <td className="px-4 py-2.5 align-top">
                  <LinkStatusBadge link={link} />
                </td>
                <td className="px-4 py-2.5 align-top">
                  <span className="inline-flex items-center gap-2 font-mono text-sm text-foreground">
                    <Activity aria-hidden="true" className="size-4 text-muted-foreground" />
                    {link.clickCount}
                  </span>
                </td>
                <td className="px-4 py-2.5 align-top text-sm text-muted-foreground">
                  {formatDate(link.expiresAt)}
                </td>
                <td className="px-4 py-2.5 align-top text-sm text-muted-foreground">
                  {formatDate(link.createdAt)}
                </td>
                <td className="px-4 py-2.5 align-top">
                  <div className="flex items-center gap-1">
                    <CopyShortUrlButton shortUrl={link.shortUrl} />
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
                    <Link to={`/links/${link.id}/edit`}>
                      <Button aria-label="Edit link" size="sm" variant="ghost">
                        <Edit3 aria-hidden="true" className="size-4" />
                      </Button>
                    </Link>
                    {link.active ? (
                      <Button
                        aria-label="Deactivate link"
                        disabled={isMutating}
                        onClick={() => onDeactivate(link.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <PauseCircle aria-hidden="true" className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        aria-label="Activate link"
                        disabled={isMutating}
                        onClick={() => onActivate(link.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <PlayCircle aria-hidden="true" className="size-4" />
                      </Button>
                    )}
                    <DeleteLinkDialog
                      isDeleting={isMutating}
                      link={link}
                      onConfirm={onDelete}
                    />
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
