import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from './register-form'

const registerAsync = vi.fn()
const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    isRegistering: false,
    registerAsync,
  }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('redirects to login after register', async () => {
    const user = userEvent.setup()
    registerAsync.mockResolvedValue({
      id: 'user-id',
      name: 'Igor',
      email: 'igor@email.com',
      createdAt: '2026-05-04T20:00:00.000Z',
    })

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/name/i), 'Igor')
    await user.type(screen.getByLabelText(/email/i), 'igor@email.com')
    await user.type(screen.getByLabelText(/password/i), '12345')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(registerAsync).toHaveBeenCalledWith({
      name: 'Igor',
      email: 'igor@email.com',
      password: '12345',
    })
    expect(navigateMock).toHaveBeenCalledWith('/login', {
      replace: true,
    })
  })
})
