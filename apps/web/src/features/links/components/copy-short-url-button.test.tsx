import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CopyShortUrlButton } from './copy-short-url-button'

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)

describe('CopyShortUrlButton', () => {
  afterEach(() => {
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor)
      return
    }

    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('copies link to clipboard', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })

    render(<CopyShortUrlButton shortUrl="http://localhost:3000/r/backend" />)
    await user.click(screen.getByRole('button', { name: /copy short url/i }))

    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/r/backend')
  })

  it('restores clipboard after previous override', () => {
    expect(
      Object.getOwnPropertyDescriptor(navigator, 'clipboard'),
    ).toEqual(originalClipboardDescriptor)
  })
})
