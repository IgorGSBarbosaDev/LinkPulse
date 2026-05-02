import { BarChart3, Edit3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import type { ApiError } from '../../../shared/api/api-error'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { Button } from '../../../shared/components/ui/button'
import { LinkDetailsCard } from '../components/link-details-card'
import { useLink } from '../hooks/use-link'

function getErrorCopy(error: ApiError | null) {
  if (error?.code === 'NOT_FOUND') {
    return {
      title: 'Link not found',
      description: 'This link no longer exists or was removed.',
    }
  }

  if (error?.code === 'FORBIDDEN') {
    return {
      title: 'Access denied',
      description: 'You do not have permission to view this link.',
    }
  }

  return {
    title: 'Could not load link',
    description: error?.message ?? 'The link could not be loaded. Try again.',
  }
}

export function LinkDetailsPage() {
  const { id } = useParams()
  const linkQuery = useLink(id)
  const errorCopy = getErrorCopy(linkQuery.error ?? null)

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

      {linkQuery.isError ? (
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
