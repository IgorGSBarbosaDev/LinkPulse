import { Activity, ArrowLeft, BarChart3, Edit3, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../../shared/components/ui/button'
import type { LinkDetails } from '../types'
import { CopyShortUrlButton } from './copy-short-url-button'
import { LinkStatusBadge } from './link-status-badge'

type LinkDetailsCardProps = {
  link: LinkDetails
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'No expiration'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatNumber(value: number | null) {
  if (value === null) {
    return 'No limit'
  }

  return new Intl.NumberFormat('en').format(value)
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border bg-card p-3">
      <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 break-words text-sm text-foreground">
        {value}
      </span>
    </div>
  )
}

export function LinkDetailsCard({ link }: LinkDetailsCardProps) {
  const displayTitle = link.title || link.shortCode

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-surface px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
            Link overview
          </h2>
        </div>
        <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-2xl font-semibold text-foreground">
                {displayTitle}
              </h3>
              <LinkStatusBadge link={link} />
            </div>
            <a
              className="break-all font-mono text-sm text-muted-foreground hover:text-foreground hover:underline"
              href={link.shortUrl}
              rel="noreferrer"
              target="_blank"
            >
              {link.shortUrl}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-1 py-1">
            <CopyShortUrlButton shortUrl={link.shortUrl} />
            <Link to={`/links/${link.id}/edit`}>
              <Button size="sm" variant="secondary">
                <Edit3 aria-hidden="true" className="size-4" />
                Edit
              </Button>
            </Link>
            <Link to={`/links/${link.id}/analytics`}>
              <Button size="sm" variant="secondary">
                <BarChart3 aria-hidden="true" className="size-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {link.description ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            {link.description}
          </p>
        ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Short code" value={link.shortCode} />
        <DetailItem label="Custom alias" value={link.customAlias || 'None'} />
        <DetailItem
          label="Clicks"
          value={new Intl.NumberFormat('en').format(link.clickCount)}
        />
        <DetailItem label="Max clicks" value={formatNumber(link.maxClicks)} />
        <DetailItem label="Expiration" value={formatDateTime(link.expiresAt)} />
        <DetailItem label="Created" value={formatDateTime(link.createdAt)} />
        <DetailItem label="Updated" value={formatDateTime(link.updatedAt)} />
        <DetailItem
          label="Limit reached"
          value={link.reachedMaxClicks ? 'Yes' : 'No'}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            Original URL
          </span>
          <a
            className="break-all text-sm leading-6 text-foreground hover:underline"
            href={link.originalUrl}
            rel="noreferrer"
            target="_blank"
          >
            {link.originalUrl}
            <ExternalLink aria-hidden="true" className="ml-2 inline size-4" />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium uppercase tracking-label text-foreground transition-colors hover:bg-muted"
          to="/links"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to links
        </Link>
        <Link to={`/links/${link.id}/analytics`}>
          <Button size="sm" variant="secondary">
            <Activity aria-hidden="true" className="size-4" />
            View analytics
          </Button>
        </Link>
      </div>
    </div>
  )
}
