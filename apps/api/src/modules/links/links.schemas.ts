import { z } from 'zod'

const customAliasSchema = z
  .string()
  .trim()
  .min(3, 'The alias must have at least 3 characters.')
  .max(50, 'The alias must have at most 50 characters.')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Must contain only letters, numbers, underscores or hyphens.',
  )
  .transform((value) => value.toLowerCase())

const optionalTextSchema = (max: number, fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} can't be empty.`)
    .max(max, `${fieldName} must have at most ${max} characters.`)

const futureDateSchema = z.coerce
  .date({
    error: 'Expiration date must be a valid date string or timestamp.',
  })
  .refine((date) => date.getTime() > Date.now(), {
    message: 'Expiration date must be a future date.',
  })

function isHttpUrl(value: string) {
  try {
    const protocol = new URL(value).protocol

    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

const httpUrlSchema = z
  .string()
  .trim()
  .url('Informe uma URL válida.')
  .refine(isHttpUrl, 'A URL deve usar HTTP ou HTTPS.')

const activeQuerySchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional()

export const createLinkSchema = z.object({
  body: z.object({
    originalUrl: httpUrlSchema,

    customAlias: customAliasSchema.optional(),

    title: optionalTextSchema(120, 'Título').optional(),

    description: optionalTextSchema(500, 'Descrição').optional(),

    expiresAt: futureDateSchema.optional(),

    maxClicks: z.coerce
      .number()
      .int('O limite máximo de cliques deve ser um número inteiro.')
      .positive('O limite máximo de cliques deve ser maior que zero.')
      .optional(),
  }),
})

export const updateLinkSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do link inválido.'),
  }),

  body: z
    .object({
      originalUrl: httpUrlSchema.optional(),

      customAlias: customAliasSchema.optional(),

      title: optionalTextSchema(120, 'Título').nullable().optional(),

      description: optionalTextSchema(500, 'Descrição').nullable().optional(),

      expiresAt: z.union([futureDateSchema, z.null()]).optional(),

      maxClicks: z
        .union([
          z.coerce
            .number()
            .int('O limite máximo de cliques deve ser um número inteiro.')
            .positive('O limite máximo de cliques deve ser maior que zero.'),
          z.null(),
        ])
        .optional(),

      active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Informe ao menos um campo para atualização.',
    }),
})

export const linkIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do link inválido.'),
  }),
})

export const listLinksSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),

    search: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional(),

    active: activeQuerySchema,

    sort: z
      .enum(['createdAt', 'clickCount', 'title'])
      .default('createdAt'),

    order: z
      .enum(['asc', 'desc'])
      .default('desc'),
  }),
})
