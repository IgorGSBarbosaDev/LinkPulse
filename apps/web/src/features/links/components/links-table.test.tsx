import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LinksTable } from './links-table'

describe('LinksTable', () => {
  it('displays links', () => {
    render(
      <MemoryRouter>
        <LinksTable
          isMutating={false}
          links={[
            {
              id: 'link-1',
              title: 'Backend article',
              originalUrl: 'https://example.com/backend',
              shortCode: 'backend',
              shortUrl: 'http://localhost:3000/r/backend',
              active: true,
              expired: false,
              clickCount: 10,
              expiresAt: null,
              createdAt: '2026-04-23T20:00:00.000Z',
            },
          ]}
          onActivate={vi.fn()}
          onDeactivate={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(/backend article/i)).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/example\.com\/backend/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy short url/i })).toBeInTheDocument()
  })
})
