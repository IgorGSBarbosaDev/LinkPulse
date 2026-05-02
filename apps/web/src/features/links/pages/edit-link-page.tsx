import { useParams } from 'react-router-dom'

import { PageContainer } from '../../../shared/components/layout/page-container'
import { PlaceholderPanel } from '../../../shared/components/feedback/placeholder-panel'

export function EditLinkPage() {
  const { id } = useParams()

  return (
    <PageContainer
      title="Edit link"
      description="Edit route prepared for mutable fields and active status."
    >
      <PlaceholderPanel
        title="Edit form not wired yet"
        description={`Phase 4 will load link ${id ?? 'record'} and submit validated updates.`}
      />
    </PageContainer>
  )
}
