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

describe('LinksPage quota', () => {
  it('renders quota and keeps New link enabled when below limit', () => {
    useLinksMock.mockReturnValue({
      data: {
        ...baseData,
        quota: {
          limit: 15,
          used: 14,
          remaining: 1,
        },
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

    expect(screen.getByText('Links used:')).toBeInTheDocument()
    expect(screen.getByText('14/15')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /new link/i })).toHaveAttribute(
      'href',
      '/links/new',
    )
  })

  it('renders quota reached state and disables New link', () => {
    useLinksMock.mockReturnValue({
      data: {
        ...baseData,
        quota: {
          limit: 15,
          used: 15,
          remaining: 0,
        },
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

    expect(screen.getByText('15/15')).toBeInTheDocument()
    expect(
      screen.getByText('You have reached the maximum limit of 15 links.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new link/i })).toBeDisabled()
  })
})
