import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { Activity, Link as LinkIcon, MousePointerClick, TimerOff } from 'lucide-react'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { LinkFilters } from '../components/link-filters'
import { LinksPagination } from '../components/links-pagination'
import { LinksTable } from '../components/links-table'
import { useLinks } from '../hooks/use-links'
import type { LinksFilters as LinksFiltersData } from '../types'
import {
  buildLinksSearchParams,
  parseLinksSearchParams,
  patchLinksFilters,
} from '../utils/link-filters'

export function LinksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseLinksSearchParams(searchParams)
  const linksQuery = useLinks(filters)

  function updateFilters(patch: Partial<LinksFiltersData>) {
    setSearchParams(buildLinksSearchParams(patchLinksFilters(filters, patch)), {
      replace: true,
    })
  }

  const links = linksQuery.data?.data ?? []
  const pagination = linksQuery.data?.pagination
  const hasActiveFilters = Boolean(filters.search.trim()) || filters.active !== 'all'
  const totalLinks = pagination?.totalItems ?? links.length
  const activeLinks = links.filter((link) => link.active).length
  const expiredLinks = links.filter((link) => link.expired).length
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)

  return (
    <PageContainer
      title="Links"
      description="Manage short links, filter by status, and run quick actions."
      actions={
        <Link to="/links/new">
          <Button size="sm" variant="primary">
            New link
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <LinkFilters filters={filters} onChange={updateFilters} />

        {linksQuery.isLoading ? <LoadingState label="Loading links" /> : null}

        {linksQuery.isError ? (
          <ErrorState
            description={linksQuery.error.message}
            onRetry={() => {
              void linksQuery.refetch()
            }}
            title="Could not load links"
          />
        ) : null}

        {linksQuery.isSuccess && links.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              title="No links match filters"
              description="Adjust search or status filters to see more links."
              action={
                <Button
                  onClick={() =>
                    setSearchParams(buildLinksSearchParams({
                      page: 1,
                      limit: filters.limit,
                      search: '',
                      active: 'all',
                      sort: filters.sort,
                      order: filters.order,
                    }))
                  }
                  size="sm"
                  variant="secondary"
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No links yet"
              description="Create your first short link to start tracking clicks."
              action={
                <Link to="/links/new">
                  <Button size="sm" variant="primary">
                    New link
                  </Button>
                </Link>
              }
            />
          )
        ) : null}

        {linksQuery.isSuccess && links.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-border bg-card px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      Total links
                    </span>
                    <span className="font-mono text-[1.625rem] font-semibold leading-tight text-foreground">
                      {new Intl.NumberFormat('en').format(totalLinks)}
                    </span>
                  </div>
                  <span className="rounded-md border border-border bg-surface p-2 text-muted-foreground">
                    <LinkIcon aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      Active links
                    </span>
                    <span className="font-mono text-[1.625rem] font-semibold leading-tight text-foreground">
                      {new Intl.NumberFormat('en').format(activeLinks)}
                    </span>
                  </div>
                  <span className="rounded-md border border-border bg-surface p-2 text-muted-foreground">
                    <Activity aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      Expired links
                    </span>
                    <span className="font-mono text-[1.625rem] font-semibold leading-tight text-foreground">
                      {new Intl.NumberFormat('en').format(expiredLinks)}
                    </span>
                  </div>
                  <span className="rounded-md border border-border bg-surface p-2 text-muted-foreground">
                    <TimerOff aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      Total clicks
                    </span>
                    <span className="font-mono text-[1.625rem] font-semibold leading-tight text-foreground">
                      {new Intl.NumberFormat('en').format(totalClicks)}
                    </span>
                  </div>
                  <span className="rounded-md border border-border bg-surface p-2 text-muted-foreground">
                    <MousePointerClick aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </div>
            </div>
            <LinksTable
              links={links}
            />
            {pagination ? (
              <LinksPagination
                onPageChange={(page) => updateFilters({ page })}
                pagination={pagination}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </PageContainer>
  )
}
