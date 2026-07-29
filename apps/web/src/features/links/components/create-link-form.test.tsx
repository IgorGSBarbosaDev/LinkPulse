import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CreateLinkForm } from './create-link-form'

const mutateAsyncMock = vi.fn()

vi.mock('../hooks/use-create-link', () => ({
  useCreateLink: () => ({
    isPending: false,
    mutateAsync: mutateAsyncMock,
  }),
}))

describe('CreateLinkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
