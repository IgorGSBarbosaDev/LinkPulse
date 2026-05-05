import { describe, expect, it } from 'vitest'

import { generateSecureToken } from '../src/shared/utils/generate-secure-token.js'
import { hashToken } from '../src/shared/utils/hash-token.js'
import { normalizeEmail } from '../src/shared/utils/normalize-email.js'

describe('email verification utils', () => {
  it('normalizes email with trim and lowercase', () => {
    expect(normalizeEmail('  Igor@Email.COM  ')).toBe('igor@email.com')
  })

  it('generates secure hex tokens', () => {
    const token = generateSecureToken()

    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('hashes token with sha256 and never returns the plain token', () => {
    const token = 'plain-token'
    const hash = hashToken(token)

    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).not.toBe(token)
    expect(hashToken(token)).toBe(hash)
  })
})
