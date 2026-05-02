import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '../../../shared/components/feedback/empty-state'
import { PageContainer } from '../../../shared/components/layout/page-container'

export function LinkDetailsPage() {
  const { id } = useParams()

  return (
    <PageContainer
      title="Link details"
      description="Detail route prepared for metadata, status, limits, and management actions."
      actions={
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            to={`/links/${id}/analytics`}
          >
            Analytics
          </Link>
          <Link
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            to={`/links/${id}/edit`}
          >
            Edit
          </Link>
        </div>
      }
    >
      <EmptyState
        title="Link detail not wired yet"
        description={`Phase 4 will load link ${id ?? 'record'} and expose ownership-safe actions.`}
      />
    </PageContainer>
  )
}
