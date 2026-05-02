import { describe, expect, it } from 'vitest'

import { createLinkSchema, editLinkSchema } from './link-schemas'

const futureDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16)
const pastDate = new Date(Date.now() - 86_400_000).toISOString().slice(0, 16)

describe('link schemas', () => {
  it('accepts valid create link values', () => {
    const result = createLinkSchema.safeParse({
      originalUrl: 'https://example.com/article',
      customAlias: 'backend_article-1',
      title: 'Backend article',
      description: 'Architecture notes',
      expiresAt: futureDate,
      maxClicks: '500',
    })

    expect(result.success).toBe(true)
  })

  it('blocks invalid create link values before submitting', () => {
    const result = createLinkSchema.safeParse({
      originalUrl: 'not-a-url',
      customAlias: 'bad alias',
      title: '',
      description: '',
      expiresAt: pastDate,
      maxClicks: '0',
    })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.originalUrl).toBeDefined()
    expect(result.error?.flatten().fieldErrors.customAlias).toBeDefined()
    expect(result.error?.flatten().fieldErrors.expiresAt).toBeDefined()
    expect(result.error?.flatten().fieldErrors.maxClicks).toBeDefined()
  })

  it('accepts valid edit link values', () => {
    const result = editLinkSchema.safeParse({
      title: 'Updated title',
      description: '',
      expiresAt: futureDate,
      maxClicks: '1000',
      active: false,
    })

    expect(result.success).toBe(true)
  })
})
