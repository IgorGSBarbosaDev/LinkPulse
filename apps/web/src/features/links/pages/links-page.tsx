import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { LinkFilters } from '../components/link-filters'
import { LinksPagination } from '../components/links-pagination'
import { LinksTable } from '../components/links-table'
import {
  useActivateLink,
  useDeactivateLink,
  useDeleteLink,
} from '../hooks/use-link-actions'
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
  const activateLink = useActivateLink()
  const deactivateLink = useDeactivateLink()
  const deleteLink = useDeleteLink()
  const isMutating =
    activateLink.isPending || deactivateLink.isPending || deleteLink.isPending

  function updateFilters(patch: Partial<LinksFiltersData>) {
    setSearchParams(buildLinksSearchParams(patchLinksFilters(filters, patch)), {
      replace: true,
    })
  }

  const links = linksQuery.data?.data ?? []
  const pagination = linksQuery.data?.pagination
  const hasActiveFilters = Boolean(filters.search.trim()) || filters.active !== 'all'

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
            <LinksTable
              isMutating={isMutating}
              links={links}
              onActivate={(linkId) => activateLink.mutate(linkId)}
              onDeactivate={(linkId) => deactivateLink.mutate(linkId)}
              onDelete={(linkId) => deleteLink.mutate(linkId)}
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
