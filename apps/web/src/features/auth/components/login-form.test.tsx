import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from './login-form'

const loginAsync = vi.fn()
const resendVerificationEmailAsync = vi.fn()

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    isLoggingIn: false,
    loginAsync,
  }),
}))

vi.mock('../hooks/use-email-verification', () => ({
  useEmailVerification: () => ({
    isResendingVerificationEmail: false,
    resendVerificationEmailAsync,
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

  it('shows resend action when login is blocked by unverified email', async () => {
    const user = userEvent.setup()
    loginAsync.mockRejectedValue({
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before logging in.',
      status: 403,
    })

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/email/i), 'igor@email.com')
    await user.type(screen.getByLabelText(/password/i), '12345')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText(/your account has not been verified yet/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /resend verification email/i }))

    expect(resendVerificationEmailAsync).toHaveBeenCalledWith({
      email: 'igor@email.com',
    })
  })
})
