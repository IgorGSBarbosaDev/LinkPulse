import { PageContainer } from '../../../shared/components/layout/page-container'
import { CreateLinkForm } from '../components/create-link-form'

export function CreateLinkPage() {
  return (
    <PageContainer
      title="Create link"
      description="Create a short link with optional alias, expiration, and click limit."
    >
      <CreateLinkForm />
    </PageContainer>
  )
}
