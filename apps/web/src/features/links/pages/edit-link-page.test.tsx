import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { EditLinkPage } from './edit-link-page'

const useLinkMock = vi.fn()

vi.mock('../hooks/use-link', () => ({
  useLink: (...args: unknown[]) => useLinkMock(...args),
}))

describe('EditLinkPage', () => {
  it('shows forbidden state for 403 errors', () => {
    useLinkMock.mockReturnValue({
      error: { code: 'FORBIDDEN', message: 'Forbidden', status: 403 },
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/links/link-1/edit']}>
        <Routes>
          <Route path="/links/:id/edit" element={<EditLinkPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
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
      <MemoryRouter initialEntries={['/links/link-1/edit']}>
        <Routes>
          <Route path="/links/:id/edit" element={<EditLinkPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/^not found$/i)).toBeInTheDocument()
  })
})
