import type { z } from "zod"
import {
    createLinkSchema,
    listLinksSchema,
    linkIdParamsSchema,
    updateLinkSchema,
} from './links.schemas.js'


export type CreateLinkInput = z.infer<typeof createLinkSchema>['body']

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>['body']

export type ListLinksQuery = z.infer<typeof listLinksSchema>['query']

export type LinkIdParams = z.infer<typeof linkIdParamsSchema>['params']

export type linkSortField = 'createdAt' | 'clickCount' | 'title'

export type SortOrder = 'asc' | 'desc'

export type Pagination = {
    page: number
    limit: number
    totalItems: number
    totalPages: number
}

export type PaginatedResult<T> = {
    data: T[]
    pagination: Pagination
}

export type LinkResponse ={
    id: string
    originalUrl: string
    shortCode: string
    customAlias: string | null
    shortUrl: string
    title: string | null
    description: string | null
    active: boolean
    expired: boolean
    reachedMaxClicks: boolean
    expiresAt: Date | null
    maxClicks: number | null
    clickCount: number
    createdAt: Date
    updatedAt: Date
}

export type AuthenticatedRequestUser ={
    id: string
    email?: string
}
