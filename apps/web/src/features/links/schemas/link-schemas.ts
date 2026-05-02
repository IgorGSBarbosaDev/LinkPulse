import { z } from 'zod'

import type { CreateLinkRequest, UpdateLinkRequest } from '../types'

const aliasPattern = /^[a-zA-Z0-9_-]+$/
const integerPattern = /^\d+$/

function isFutureDate(value: string) {
  const timestamp = new Date(value).getTime()

  return Number.isFinite(timestamp) && timestamp > Date.now()
}

const optionalTextSchema = (max: number, fieldName: string) =>
  z.string().trim().max(max, `${fieldName} must have at most ${max} characters`)

const optionalFutureDateSchema = z
  .string()
  .trim()
  .refine((value) => !value || isFutureDate(value), {
    message: 'Expiration must be a future date',
  })

const optionalMaxClicksSchema = z
  .string()
  .trim()
  .refine((value) => !value || integerPattern.test(value), {
    message: 'Max clicks must be a whole number',
  })
  .refine((value) => !value || Number(value) > 0, {
    message: 'Max clicks must be greater than zero',
  })

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, 'Original URL is required')
    .url('Enter a valid URL'),
  customAlias: z
    .string()
    .trim()
    .refine((value) => !value || value.length >= 3, {
      message: 'Alias must have at least 3 characters',
    })
    .refine((value) => !value || value.length <= 50, {
      message: 'Alias must have at most 50 characters',
    })
    .refine((value) => !value || aliasPattern.test(value), {
      message: 'Use only letters, numbers, hyphens, or underscores',
    }),
  title: optionalTextSchema(120, 'Title'),
  description: optionalTextSchema(500, 'Description'),
  expiresAt: optionalFutureDateSchema,
  maxClicks: optionalMaxClicksSchema,
})

export const editLinkSchema = z.object({
  title: optionalTextSchema(120, 'Title'),
  description: optionalTextSchema(500, 'Description'),
  expiresAt: optionalFutureDateSchema,
  maxClicks: optionalMaxClicksSchema,
  active: z.boolean(),
})

export type CreateLinkFormValues = z.infer<typeof createLinkSchema>
export type EditLinkFormValues = z.infer<typeof editLinkSchema>

export function toCreateLinkPayload(
  values: CreateLinkFormValues,
): CreateLinkRequest {
  return {
    originalUrl: values.originalUrl.trim(),
    ...(values.customAlias.trim()
      ? { customAlias: values.customAlias.trim().toLowerCase() }
      : {}),
    ...(values.title.trim() ? { title: values.title.trim() } : {}),
    ...(values.description.trim()
      ? { description: values.description.trim() }
      : {}),
    ...(values.expiresAt.trim()
      ? { expiresAt: new Date(values.expiresAt).toISOString() }
      : {}),
    ...(values.maxClicks.trim()
      ? { maxClicks: Number(values.maxClicks) }
      : {}),
  }
}

export function toUpdateLinkPayload(
  values: EditLinkFormValues,
): UpdateLinkRequest {
  return {
    title: values.title.trim() || null,
    description: values.description.trim() || null,
    expiresAt: values.expiresAt.trim()
      ? new Date(values.expiresAt).toISOString()
      : null,
    maxClicks: values.maxClicks.trim() ? Number(values.maxClicks) : null,
    active: values.active,
  }
}

export function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}
