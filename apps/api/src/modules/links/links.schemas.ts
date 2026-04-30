import { url } from 'node:inspector';
import { z } from 'zod';

export const createLinkSchema = z.object({
    body: z.object({
        tittle: z
        .string()
        .trim()
        .min(1, 'Tittle must have at least 1 character')
        .max(120, 'Tittle must have at most 120 characters'),

        url: z
        .string()
        .url("Invalid URL format"),

        description: z
        .string()
        .trim()
        .max(500, 'Description must have at most 500 characters')
        .optional(),

        isFavorite: z
        .boolean()
        .optional()
    })
})

export const updateLinkSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid link ID format')
    }),

    body: z.object({
        title: z
        .string()
        .trim()
        .min(1, 'Title must have at least 1 character')
        .max(120, 'Title must have at most 120 characters')
        .optional(),

        url: z
        .string()
        .url("Invalid URL format")
        .optional(),

        description: z
        .string()
        .max(500, 'Description must have at most 500 characters')
        .optional(),

        isFavorite: z
        .boolean()
        .optional()
    }).refine(
        data => Object.keys(data).length > 0, 'At least one field must be provided for update'
    )
})

export const linkParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid link ID format')
    })
})

export const queryLinksSchema = z.object({
    query: z.object({
        search: z
        .string()
        .optional(),

        page: z
        .coerce.number()
        .int()
        .positive()
        .optional(),

        limit: z
        .coerce.number()
        .int()
        .positive()
        .max(100, 'Limit must be at most 100')
        .optional(),

        idFavorite: z
        .coerce.boolean()
        .optional()
    })
})