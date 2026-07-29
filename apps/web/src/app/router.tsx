import { Navigate, Route, Routes } from 'react-router-dom'

import { LinkAnalyticsPage } from '../features/analytics/pages/link-analytics-page'
import { LoginPage } from '../features/auth/pages/login-page'
import { RegisterPage } from '../features/auth/pages/register-page'
import { DashboardPage } from '../features/dashboard/pages/dashboard-page'
import { CreateLinkPage } from '../features/links/pages/create-link-page'
import { EditLinkPage } from '../features/links/pages/edit-link-page'
import { LinkDetailsPage } from '../features/links/pages/link-details-page'
import { LinksPage } from '../features/links/pages/links-page'
import { LandingPage } from '../features/marketing/pages/landing-page'
import { SettingsPage } from '../features/settings/pages/settings-page'
import { AppLayout } from '../shared/components/layout/app-layout'
import { NotFoundPage } from '../shared/pages/not-found-page'
import { ProtectedRoute, PublicRoute } from './route-guards'

export function AppRouter() {
  return (
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
  )
}
