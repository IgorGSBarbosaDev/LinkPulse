import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VerifyEmailPage } from './verify-email-page'

const verifyEmailAsync = vi.fn()
const resendVerificationEmailAsync = vi.fn()

vi.mock('../hooks/use-email-verification', () => ({
  useEmailVerification: () => ({
    isResendingVerificationEmail: false,
    resendVerificationEmailAsync,
    verifyEmailAsync,
    verifyEmailError: null,
    isVerifyingEmail: false,
  }),
}))

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads token from URL and verifies email', async () => {
    verifyEmailAsync.mockResolvedValue({
      message: 'Email verified successfully. You can now log in.',
    })

    render(
      <MemoryRouter initialEntries={['/verify-email?token=plain-token']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(verifyEmailAsync).toHaveBeenCalledWith({ token: 'plain-token' })
    })
    expect(
      await screen.findByText(/email verified successfully/i),
    ).toBeInTheDocument()
  })

  it('shows missing token state', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/this verification link cannot be used/i)).toBeInTheDocument()
  })

  it('offers resend when verification token is expired', async () => {
    const user = userEvent.setup()
    verifyEmailAsync.mockRejectedValue({
      code: 'VERIFICATION_TOKEN_EXPIRED',
      message: 'Verification token has expired.',
      status: 410,
    })
    resendVerificationEmailAsync.mockResolvedValue({
      message:
        'If this email is registered and not verified, a new verification link will be sent.',
    })

    render(
      <MemoryRouter initialEntries={['/verify-email?token=expired-token']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(/verification token expired/i),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/email/i), 'igor@email.com')
    await user.click(screen.getByRole('button', { name: /resend verification email/i }))

    expect(resendVerificationEmailAsync).toHaveBeenCalledWith({
      email: 'igor@email.com',
    })
  })

  it('orients users to login when token was already used', async () => {
    verifyEmailAsync.mockRejectedValue({
      code: 'VERIFICATION_TOKEN_ALREADY_USED',
      message: 'Verification token has already been used.',
      status: 409,
    })

    render(
      <MemoryRouter initialEntries={['/verify-email?token=used-token']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/this link was already used/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument()
  })

  it('offers resend when token was revoked', async () => {
    verifyEmailAsync.mockRejectedValue({
      code: 'VERIFICATION_TOKEN_REVOKED',
      message: 'Verification token has been revoked.',
      status: 410,
    })

    render(
      <MemoryRouter initialEntries={['/verify-email?token=revoked-token']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/this link was replaced by a newer one/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('allows retry when verification fails because of network error', async () => {
    const user = userEvent.setup()
    verifyEmailAsync
      .mockRejectedValueOnce({
        code: 'NETWORK_ERROR',
        message: 'Network error. Check API connection and try again.',
      })
      .mockResolvedValueOnce({
        message: 'Email verified successfully. You can now log in.',
      })

    render(
      <MemoryRouter initialEntries={['/verify-email?token=plain-token']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/could not reach api/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(
      await screen.findByText(/email verified successfully/i),
    ).toBeInTheDocument()
    expect(verifyEmailAsync).toHaveBeenCalledTimes(2)
  })
})
