import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LinkDetailsPage } from './link-details-page'

const useLinkMock = vi.fn()

vi.mock('../hooks/use-link', () => ({
  useLink: (...args: unknown[]) => useLinkMock(...args),
}))

describe('LinkDetailsPage', () => {
  it('shows forbidden state for 403 errors', () => {
    useLinkMock.mockReturnValue({
      error: { code: 'FORBIDDEN', message: 'Forbidden', status: 403 },
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/links/link-1']}>
        <Routes>
          <Route path="/links/:id" element={<LinkDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(
      screen.getByText(/do not have permission to access this content/i),
    ).toBeInTheDocument()
  })

  it('shows not found state for 404 errors', () => {
    useLinkMock.mockReturnValue({
      error: { code: 'NOT_FOUND', message: 'Not found', status: 404 },
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/links/link-1']}>
        <Routes>
          <Route path="/links/:id" element={<LinkDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/^not found$/i)).toBeInTheDocument()
  })
})
