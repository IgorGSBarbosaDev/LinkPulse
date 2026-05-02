import { useAuth } from '../../auth/hooks/use-auth'
import { toApiErrorCopy } from '../../../shared/api/api-error-copy'
import { LoadingState } from '../../../shared/components/feedback/loading-state'
import { ErrorState } from '../../../shared/components/feedback/error-state'
import { ForbiddenState } from '../../../shared/components/feedback/forbidden-state'
import { NotFoundState } from '../../../shared/components/feedback/not-found-state'
import { PageContainer } from '../../../shared/components/layout/page-container'
import { AccountSettingsCard } from '../components/account-settings-card'

export function SettingsPage() {
  const { isLoadingSession, logout, sessionError, user } = useAuth()
  const errorCopy = toApiErrorCopy(sessionError, 'Could not load account')

  return (
    <PageContainer
      title="Settings"
      description="Account profile and session controls."
    >
      <div className="flex flex-col gap-4">
        {isLoadingSession ? <LoadingState label="Loading account" /> : null}

        {!isLoadingSession && sessionError?.code === 'FORBIDDEN' ? (
          <ForbiddenState />
        ) : null}

        {!isLoadingSession && sessionError?.code === 'NOT_FOUND' ? (
          <NotFoundState />
        ) : null}

        {!isLoadingSession &&
        sessionError &&
        sessionError.code !== 'FORBIDDEN' &&
        sessionError.code !== 'NOT_FOUND' ? (
          <ErrorState
            description={errorCopy.description}
            title={errorCopy.title}
          />
        ) : null}

        {!isLoadingSession && user ? (
          <AccountSettingsCard
            account={{ email: user.email, name: user.name }}
            onLogout={logout}
          />
        ) : null}
      </div>
    </PageContainer>
  )
}
