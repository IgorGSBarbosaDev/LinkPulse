import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SettingsPage } from './settings-page'

const useAuthMock = vi.fn()

vi.mock('../../auth/hooks/use-auth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('SettingsPage', () => {
  it('shows loading state while account profile loads', () => {
    useAuthMock.mockReturnValue({
      isLoadingSession: true,
      logout: vi.fn(),
      sessionError: null,
      user: null,
    })

    render(<SettingsPage />)

    expect(screen.getByText(/loading account/i)).toBeInTheDocument()
  })

  it('renders account profile when session user exists', () => {
    useAuthMock.mockReturnValue({
      isLoadingSession: false,
      logout: vi.fn(),
      sessionError: null,
      user: { id: 'user-1', name: 'Owner', email: 'owner@example.com' },
    })

    render(<SettingsPage />)

    expect(screen.getByRole('heading', { name: /account profile/i })).toBeInTheDocument()
    expect(screen.getByText(/owner@example.com/i)).toBeInTheDocument()
  })

  it('shows forbidden state for 403 session errors', () => {
    useAuthMock.mockReturnValue({
      isLoadingSession: false,
      logout: vi.fn(),
      sessionError: { code: 'FORBIDDEN', message: 'Forbidden', status: 403 },
      user: null,
    })

    render(<SettingsPage />)

    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(
      screen.getByText(/do not have permission to access this content/i),
    ).toBeInTheDocument()
  })

  it('shows not found state for 404 session errors', () => {
    useAuthMock.mockReturnValue({
      isLoadingSession: false,
      logout: vi.fn(),
      sessionError: { code: 'NOT_FOUND', message: 'Not found', status: 404 },
      user: null,
    })

    render(<SettingsPage />)

    expect(screen.getByText(/^not found$/i)).toBeInTheDocument()
    expect(
      screen.getByText(/requested data was not found or was removed/i),
    ).toBeInTheDocument()
  })

  it('shows shared rate limit copy for 429 session errors', () => {
    useAuthMock.mockReturnValue({
      isLoadingSession: false,
      logout: vi.fn(),
      sessionError: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        status: 429,
      },
      user: null,
    })

    render(<SettingsPage />)

    expect(screen.getByText(/too many requests/i)).toBeInTheDocument()
    expect(
      screen.getByText(/wait a moment and try again/i),
    ).toBeInTheDocument()
  })

  it('shows shared network copy for network session errors', () => {
    useAuthMock.mockReturnValue({
      isLoadingSession: false,
      logout: vi.fn(),
      sessionError: {
        code: 'NETWORK_ERROR',
        message: 'Network error',
      },
      user: null,
    })

    render(<SettingsPage />)

    expect(screen.getByText(/network error/i)).toBeInTheDocument()
    expect(
      screen.getByText(/could not reach api\. check connection and try again/i),
    ).toBeInTheDocument()
  })
})
