import { useParams } from 'react-router-dom'

import { PageContainer } from '../../../shared/components/layout/page-container'
import { PlaceholderPanel } from '../../../shared/components/feedback/placeholder-panel'

export function LinkAnalyticsPage() {
  const { id } = useParams()

  return (
    <PageContainer
      title="Link analytics"
      description="Per-link analytics route prepared for summary cards, chart, and access events."
    >
      <PlaceholderPanel
        title="Analytics not wired yet"
        description={`Phase 5 will load summary, clicks by day, and events for link ${id ?? 'record'}.`}
      />
    </PageContainer>
  )
}
