import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CreateLinkForm } from './create-link-form'

vi.mock('../hooks/use-create-link', () => ({
  useCreateLink: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}))

describe('CreateLinkForm', () => {
  it('validates invalid URL', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CreateLinkForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/original url/i), 'not-a-url')
    await user.click(screen.getByRole('button', { name: /create link/i }))

    expect(await screen.findByText(/enter a valid url/i)).toBeInTheDocument()
  })
})
