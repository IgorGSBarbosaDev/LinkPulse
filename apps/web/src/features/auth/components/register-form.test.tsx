import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { RegisterForm } from './register-form'

const registerAsync = vi.fn()

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    isRegistering: false,
    registerAsync,
  }),
}))

describe('RegisterForm', () => {
  it('validates invalid email', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/name/i), 'Igor')
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), '12345')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument()
    expect(registerAsync).not.toHaveBeenCalled()
  })
})
