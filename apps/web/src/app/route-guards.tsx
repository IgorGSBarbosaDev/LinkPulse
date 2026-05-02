import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { LoadingState } from '../shared/components/feedback/loading-state'
import { useAuth } from '../features/auth/hooks/use-auth'

export function ProtectedRoute() {
  const location = useLocation()
  const { hasToken, isLoadingSession } = useAuth()

  if (isLoadingSession) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <LoadingState label="Restoring session" />
        </div>
      </main>
    )
  }

  if (!hasToken) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { hasToken, isAuthenticated, isLoadingSession } = useAuth()

  if (isLoadingSession) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <LoadingState label="Checking session" />
        </div>
      </main>
    )
  }

  if (hasToken && isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}
