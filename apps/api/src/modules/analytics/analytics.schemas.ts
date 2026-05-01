import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

function isValidCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  return parsed.toISOString().startsWith(value)
}

const dateStringSchema = z
  .string()
  .trim()
  .regex(dateRegex, 'Date must be in YYYY-MM-DD format.')
  .refine(isValidCalendarDate, 'Date must be a valid calendar date.')

export const analyticsLinkIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid link ID.'),
  }),
})

export const clicksByDayQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid link ID.'),
  }),
  query: z
    .object({
      from: dateStringSchema.optional(),
      to: dateStringSchema.optional(),
    })
    .refine(
      (value) => {
        const hasFrom = typeof value.from === 'string'
        const hasTo = typeof value.to === 'string'
        return (hasFrom && hasTo) || (!hasFrom && !hasTo)
      },
      {
        message: '`from` and `to` must be provided together.',
        path: ['from'],
      },
    )
    .refine(
      (value) => {
        if (!value.from || !value.to) {
          return true
        }

        return value.from <= value.to
      },
      {
        message: '`from` must be less than or equal to `to`.',
        path: ['from'],
      },
    ),
})

export const analyticsEventsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid link ID.'),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
})

