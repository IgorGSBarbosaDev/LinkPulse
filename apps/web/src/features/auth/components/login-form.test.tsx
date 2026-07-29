import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from './login-form'

const loginAsync = vi.fn()

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    isLoggingIn: false,
    loginAsync,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument()
  })

  it('shows the API error when login fails', async () => {
    const user = userEvent.setup()
    loginAsync.mockRejectedValue({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
      status: 401,
    })

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/email/i), 'igor@email.com')
    await user.type(screen.getByLabelText(/password/i), '12345')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })
})
