import { describe, expect, it } from 'vitest'

import { loginSchema, registerSchema } from './auth-schemas'

describe('auth schemas', () => {
  it('rejects invalid login email before submit', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    })

    expect(result.success).toBe(false)
  })

  it('requires login password before submit', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })

    expect(result.success).toBe(false)
  })

  it('requires register password to match backend minimum length', () => {
    const result = registerSchema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: '1234',
    })

    expect(result.success).toBe(false)
  })
})
