import { useParams } from 'react-router-dom'

import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { ForbiddenState } from '../../../shared/components/feedback/forbidden-state'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { NotFoundState } from '../../../shared/components/feedback/not-found-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { EditLinkForm } from '../components/edit-link-form'
import { useLink } from '../hooks/use-link'

export function EditLinkPage() {
  const { id } = useParams()
  const linkQuery = useLink(id)
  const errorCopy = toApiErrorCopy(linkQuery.error ?? null, 'Could not load link')

  return (
    <PageContainer
      title="Edit link"
      description="Update metadata, limits, expiration, and active status."
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

      {linkQuery.isSuccess ? <EditLinkForm link={linkQuery.data} /> : null}
    </PageContainer>
  )
}
