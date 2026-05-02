import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProtectedRoute } from './route-guards'

const useAuthMock = vi.fn()

vi.mock('../features/auth/hooks/use-auth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('ProtectedRoute', () => {
  it('shows loading state while session restores from token', () => {
    useAuthMock.mockReturnValue({
      hasToken: true,
      isAuthenticated: false,
      isLoadingSession: true,
      sessionError: null,
      token: 'token',
      user: null,
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Private page</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/restoring session/i)).toBeInTheDocument()
    expect(screen.queryByText(/private page/i)).not.toBeInTheDocument()
  })

  it('blocks unauthenticated users', () => {
    useAuthMock.mockReturnValue({
      hasToken: false,
      isAuthenticated: false,
      isLoadingSession: false,
      sessionError: null,
      token: null,
      user: null,
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Private page</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
    expect(screen.queryByText(/private page/i)).not.toBeInTheDocument()
  })

  it('allows route when token exists but session load failed with non-401 error', () => {
    useAuthMock.mockReturnValue({
      hasToken: true,
      isAuthenticated: false,
      isLoadingSession: false,
      sessionError: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        status: 429,
      },
      token: 'token',
      user: null,
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Private page</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/private page/i)).toBeInTheDocument()
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument()
  })

  it('renders protected page for authenticated users', () => {
    useAuthMock.mockReturnValue({
      hasToken: true,
      isAuthenticated: true,
      isLoadingSession: false,
      sessionError: null,
      token: 'token',
      user: { email: 'owner@example.com', id: 'user-1', name: 'Owner' },
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Private page</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/private page/i)).toBeInTheDocument()
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument()
  })
})
