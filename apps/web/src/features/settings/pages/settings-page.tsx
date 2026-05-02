import { PageContainer } from '../../../shared/components/layout/page-container'
import { PlaceholderPanel } from '../../../shared/components/feedback/placeholder-panel'

export function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Protected placeholder only. Design docs keep settings outside strict MVP functionality."
    >
      <PlaceholderPanel
        title="Settings functionality is out of MVP"
        description="Route exists because the PRD route inventory includes it, but no account settings behavior is implemented in Phase 1."
      />
    </PageContainer>
  )
}
