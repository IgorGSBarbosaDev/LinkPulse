import { useParams } from 'react-router-dom'

import type { ApiError } from '../../../shared/api/api-error'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { EditLinkForm } from '../components/edit-link-form'
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
      description: 'You do not have permission to edit this link.',
    }
  }

  return {
    title: 'Could not load link',
    description: error?.message ?? 'The link could not be loaded. Try again.',
  }
}

export function EditLinkPage() {
  const { id } = useParams()
  const linkQuery = useLink(id)
  const errorCopy = getErrorCopy(linkQuery.error ?? null)

  return (
    <PageContainer
      title="Edit link"
      description="Update metadata, expiration, click limit, and active status."
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

      {linkQuery.isSuccess ? <EditLinkForm link={linkQuery.data} /> : null}
    </PageContainer>
  )
}
