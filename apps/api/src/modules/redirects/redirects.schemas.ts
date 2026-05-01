import { z } from 'zod'

const shortCodeSchema = z
  .string()
  .trim()
  .min(3, 'Short code must have at least 3 characters.')
  .max(50, 'Short code must have at most 50 characters.')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Short code must contain only letters, numbers, underscores or hyphens.',
  )
  .transform((value) => value.toLowerCase())

export const redirectParamsSchema = z.object({
  params: z.object({
    shortCode: shortCodeSchema,
  }),
})
