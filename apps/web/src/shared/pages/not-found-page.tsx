import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

import { PublicFeedbackPage } from '../components/feedback/public-feedback-page'

export function NotFoundPage() {
  return (
    <PublicFeedbackPage
      description="This route is not available in LinkPulse. Check the URL or return to the home page."
      footer={
        <Link
          className="inline-flex rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          to="/"
        >
          Back home
        </Link>
      }
      icon={SearchX}
      title="Page not found"
    />
  )
}
