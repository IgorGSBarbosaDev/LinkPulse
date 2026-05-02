import { describe, expect, it } from 'vitest'

import { getDefaultDateRange } from './analytics-date-range'

describe('analytics date range', () => {
  it('returns inclusive last 7 day date strings', () => {
    expect(getDefaultDateRange(new Date('2026-04-23T18:30:00.000Z'))).toEqual({
      from: '2026-04-17',
      to: '2026-04-23',
    })
  })
})
