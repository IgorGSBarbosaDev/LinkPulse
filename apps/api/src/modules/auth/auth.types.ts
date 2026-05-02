import type { z } from "zod"
import type { loginSchema, registerSchema } from './auth.schemas.js'

export type RegisterInput = z.infer<typeof registerSchema>['body']

export type LoginInput = z.infer<typeof loginSchema>['body']

export type AuthUser = {
    id: string
    name: string
    email: string
}
export type RegisteredUser = AuthUser & {
    createdAt: Date
}
export type AuthResponse = {
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
    user: AuthUser
}
export type JwtPayload = {
    sub: string
    email: string
}
