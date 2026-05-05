import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { EmailVerificationSentPage } from './email-verification-sent-page'

const resendVerificationEmailAsync = vi.fn()

vi.mock('../hooks/use-email-verification', () => ({
  useEmailVerification: () => ({
    isResendingVerificationEmail: false,
    resendVerificationEmailAsync,
  }),
}))

describe('EmailVerificationSentPage', () => {
  it('shows email validation instruction and can resend verification email', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/email-verification-sent', state: { email: 'igor@email.com' } }]}>
        <EmailVerificationSentPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(/validar email cadastrado\. favor olhar sua caixa de entrada\./i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /resend verification email/i }))

    expect(resendVerificationEmailAsync).toHaveBeenCalledWith({
      email: 'igor@email.com',
    })
  })
})
