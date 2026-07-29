import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LinksTable } from './links-table'

describe('LinksTable', () => {
  it('displays links', () => {
    render(
      <MemoryRouter>
        <LinksTable
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
        />
      </MemoryRouter>,
    )

    expect(screen.getAllByText(/backend article/i)).not.toHaveLength(0)
    expect(
      screen.getAllByText(/http:\/\/localhost:3000\/r\/backend/i),
    ).not.toHaveLength(0)
    expect(
      screen.getAllByRole('button', { name: /copy short url/i }),
    ).not.toHaveLength(0)
  })
})
