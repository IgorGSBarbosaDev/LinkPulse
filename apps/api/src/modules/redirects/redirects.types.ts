import type { z } from 'zod'
import type { redirectParamsSchema } from './redirects.schemas.js'

export type RedirectParams = z.infer<typeof redirectParamsSchema>['params']

export type RedirectRequestMetadata = {
  ipAddress: string | null
  userAgent: string | null
  referer: string | null
}

export type ResolveRedirectInput = {
  shortCode: string
  metadata: RedirectRequestMetadata
}

export type RedirectResult = {
  originalUrl: string
}

export type RedirectLinkRecord = {
  id: string
  originalUrl: string
  shortCode: string
  active: boolean
  expiresAt: Date | null
  maxClicks: number | null
  clickCount: number
  deletedAt: Date | null
}

export type CreateAccessEventInput = {
  shortLinkId: string
  ipAddress: string | null
  userAgent: string | null
  referer: string | null
}
