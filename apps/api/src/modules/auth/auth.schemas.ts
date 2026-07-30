import { z } from "zod"

export const registerSchema = z.object({
    body: z.object({
        name: z
        .string()
        .trim()
        .min(2, 'Name must have at least 2 characters')
        .max(120, 'Name must have at most 120 characters'),

        email: z
        .string()
        .trim()
        .email('Invalid email address')
        .max(180, 'Email must have at most 180 characters')
        .toLowerCase(),

        password: z
        .string()
        .trim()
        .min(5, 'Password must have at least 5 characters')
        .max(60, 'Password must have at most 60 characters')
    }),
})

export const loginSchema = z.object({
    body: z.object({
    email: z
    .string()
    .trim()
    .email()
    .toLowerCase(),

    password: z
    .string()
    .trim()
    .min(1, 'Password is required')
    }),
})
