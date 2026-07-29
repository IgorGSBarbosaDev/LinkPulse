import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoadingState } from '../shared/components/feedback/loading-state'
import { AppLayout } from '../shared/components/layout/app-layout'
import { NotFoundPage } from '../shared/pages/not-found-page'
import { ProtectedRoute, PublicRoute } from './route-guards'

const LandingPage = lazy(() =>
  import('../features/marketing/pages/landing-page').then((module) => ({
    default: module.LandingPage,
  })),
)
const LoginPage = lazy(() =>
  import('../features/auth/pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)
const RegisterPage = lazy(() =>
  import('../features/auth/pages/register-page').then((module) => ({
    default: module.RegisterPage,
  })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
)
const CreateLinkPage = lazy(() =>
  import('../features/links/pages/create-link-page').then((module) => ({
    default: module.CreateLinkPage,
  })),
)
const EditLinkPage = lazy(() =>
  import('../features/links/pages/edit-link-page').then((module) => ({
    default: module.EditLinkPage,
  })),
)
const LinkDetailsPage = lazy(() =>
  import('../features/links/pages/link-details-page').then((module) => ({
    default: module.LinkDetailsPage,
  })),
)
const LinksPage = lazy(() =>
  import('../features/links/pages/links-page').then((module) => ({
    default: module.LinksPage,
  })),
)
const LinkAnalyticsPage = lazy(() =>
  import('../features/analytics/pages/link-analytics-page').then((module) => ({
    default: module.LinkAnalyticsPage,
  })),
)
const SettingsPage = lazy(() =>
  import('../features/settings/pages/settings-page').then((module) => ({
    default: module.SettingsPage,
  })),
)

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState label="Loading page" />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/links/new" element={<CreateLinkPage />} />
            <Route path="/links/:id" element={<LinkDetailsPage />} />
            <Route path="/links/:id/edit" element={<EditLinkPage />} />
            <Route path="/links/:id/analytics" element={<LinkAnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="/app" element={<Navigate replace to="/dashboard" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
