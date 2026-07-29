import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LinksPage } from './links-page'

const useLinksMock = vi.fn()

vi.mock('../hooks/use-links', () => ({
  useLinks: (...args: unknown[]) => useLinksMock(...args),
}))

const baseData = {
  data: [
    {
      id: 'link-1',
      title: 'Example',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      customAlias: null,
      shortUrl: 'http://localhost:3000/r/abc123',
      active: true,
      expired: false,
      reachedMaxClicks: false,
      clickCount: 10,
      expiresAt: null,
      createdAt: '2026-04-23T20:00:00.000Z',
      updatedAt: '2026-04-23T20:00:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 1,
    totalPages: 1,
  },
}

describe('LinksPage', () => {
  it('keeps New link enabled without a per-user quota', () => {
    useLinksMock.mockReturnValue({
      data: {
        ...baseData,
      },
      isError: false,
      isLoading: false,
      isSuccess: true,
    })

    render(
      <MemoryRouter>
        <LinksPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /new link/i })).toHaveAttribute(
      'href',
      '/links/new',
    )
  })
})
