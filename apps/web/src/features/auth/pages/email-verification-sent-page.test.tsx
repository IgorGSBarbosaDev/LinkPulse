import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EmailVerificationSentPage } from './email-verification-sent-page'

const resendVerificationEmailAsync = vi.fn()

vi.mock('../hooks/use-email-verification', () => ({
  useEmailVerification: () => ({
    isResendingVerificationEmail: false,
    resendVerificationEmailAsync,
  }),
}))

describe('EmailVerificationSentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows email validation instruction and can resend verification email', async () => {
    const user = userEvent.setup()
    resendVerificationEmailAsync.mockResolvedValue({
      message:
        'If this email is registered and not verified, a new verification link will be sent.',
    })

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/email-verification-sent', state: { email: 'igor@email.com' } },
        ]}
      >
        <EmailVerificationSentPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(/we sent a verification link to igor@email\.com/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /resend verification email/i }))

    expect(resendVerificationEmailAsync).toHaveBeenCalledWith({
      email: 'igor@email.com',
    })
    expect(
      await screen.findByText(/a new verification link will be sent/i),
    ).toBeInTheDocument()
  })

  it('asks for an email before resending when route state is missing', async () => {
    const user = userEvent.setup()
    resendVerificationEmailAsync.mockResolvedValue({
      message:
        'If this email is registered and not verified, a new verification link will be sent.',
    })

    render(
      <MemoryRouter initialEntries={['/email-verification-sent']}>
        <EmailVerificationSentPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/email/i), 'owner@example.com')
    await user.click(screen.getByRole('button', { name: /resend verification email/i }))

    expect(resendVerificationEmailAsync).toHaveBeenCalledWith({
      email: 'owner@example.com',
    })
  })

  it('shows resend error copy', async () => {
    const user = userEvent.setup()
    resendVerificationEmailAsync.mockRejectedValue({
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      status: 429,
    })

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/email-verification-sent', state: { email: 'igor@email.com' } },
        ]}
      >
        <EmailVerificationSentPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /resend verification email/i }))

    await waitFor(() => {
      expect(screen.getByText(/you reached the resend limit/i)).toBeInTheDocument()
    })
  })
})
