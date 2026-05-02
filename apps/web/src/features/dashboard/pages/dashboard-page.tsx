import { PageContainer } from '../../../shared/components/layout/page-container'
import { PlaceholderPanel } from '../../../shared/components/feedback/placeholder-panel'

export function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      description="Portfolio-wide summary route prepared for total links, clicks, top links, and recent activity."
    >
      <PlaceholderPanel
        title="Dashboard data not wired yet"
        description="Phase 5 will connect metrics, top links, recent activity, and clicks-by-day chart to backend analytics."
      />
    </PageContainer>
  )
}
