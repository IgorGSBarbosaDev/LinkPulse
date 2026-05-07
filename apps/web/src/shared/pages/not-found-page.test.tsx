import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { NotFoundPage } from './not-found-page'

describe('NotFoundPage', () => {
  it('renders a polished public 404 page', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByText(/this route is not available in linkpulse/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toBeInTheDocument()
  })
})
