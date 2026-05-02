import { PageContainer } from '../../../shared/components/layout/page-container'
import { PlaceholderPanel } from '../../../shared/components/feedback/placeholder-panel'

export function CreateLinkPage() {
  return (
    <PageContainer
      title="Create link"
      description="Create route prepared for original URL, alias, title, description, expiration, and max clicks."
    >
      <PlaceholderPanel
        title="Create form not wired yet"
        description="Phase 4 will add React Hook Form, Zod validation, and create-link mutation."
      />
    </PageContainer>
  )
}
