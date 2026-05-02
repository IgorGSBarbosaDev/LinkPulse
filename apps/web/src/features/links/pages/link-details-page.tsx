import { BarChart3, Edit3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { ForbiddenState } from '../../../shared/components/feedback/forbidden-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { NotFoundState } from '../../../shared/components/feedback/not-found-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { LinkDetailsCard } from '../components/link-details-card'
import { useLink } from '../hooks/use-link'

export function LinkDetailsPage() {
  const { id } = useParams()
  const linkQuery = useLink(id)
  const errorCopy = toApiErrorCopy(linkQuery.error ?? null, 'Could not load link')

  return (
    <PageContainer
      title="Link details"
      description="Review destination, status, limits, and management actions."
      actions={
        id ? (
          <div className="flex items-center gap-2">
            <Link to={`/links/${id}/analytics`}>
              <Button size="sm" variant="secondary">
                <BarChart3 aria-hidden="true" className="size-4" />
                Analytics
              </Button>
            </Link>
            <Link to={`/links/${id}/edit`}>
              <Button size="sm" variant="primary">
                <Edit3 aria-hidden="true" className="size-4" />
                Edit
              </Button>
            </Link>
          </div>
        ) : null
      }
    >
      {linkQuery.isLoading ? <LoadingState label="Loading link" /> : null}

      {linkQuery.isError && linkQuery.error?.code === 'FORBIDDEN' ? (
        <ForbiddenState />
      ) : null}

      {linkQuery.isError && linkQuery.error?.code === 'NOT_FOUND' ? (
        <NotFoundState />
      ) : null}

      {linkQuery.isError &&
      linkQuery.error?.code !== 'FORBIDDEN' &&
      linkQuery.error?.code !== 'NOT_FOUND' ? (
        <ErrorState
          description={errorCopy.description}
          onRetry={() => {
            void linkQuery.refetch()
          }}
          title={errorCopy.title}
        />
      ) : null}

      {linkQuery.isSuccess ? <LinkDetailsCard link={linkQuery.data} /> : null}
    </PageContainer>
  )
}
