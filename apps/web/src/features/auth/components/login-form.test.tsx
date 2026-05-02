import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LoginForm } from './login-form'

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    isLoggingIn: false,
    loginAsync: vi.fn(),
  }),
}))

describe('LoginForm', () => {
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
})
