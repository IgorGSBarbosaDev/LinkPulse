import type { ClicksByDayParams } from '../types'

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function getDefaultDateRange(now = new Date()): Required<ClicksByDayParams> {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const from = new Date(today)
  from.setUTCDate(today.getUTCDate() - 6)

  return {
    from: toDateOnly(from),
    to: toDateOnly(today),
  }
}
