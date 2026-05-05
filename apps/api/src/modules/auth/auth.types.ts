import type { z } from "zod"
import type {
    loginSchema,
    registerSchema,
    resendVerificationEmailSchema,
    verifyEmailSchema,
} from './auth.schemas.js'

export type RegisterInput = z.infer<typeof registerSchema>['body']

export type LoginInput = z.infer<typeof loginSchema>['body']
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body']
export type ResendVerificationEmailInput = z.infer<
    typeof resendVerificationEmailSchema
>['body']

export type AuthUser = {
    id: string
    name: string
    email: string
}
export type RegisteredUser = AuthUser & {
    emailVerifiedAt: Date | null
    createdAt: Date
}
export type RegisterResponse = {
    message: string
    emailVerificationRequired: true
    user: RegisteredUser
}
export type AuthResponse = {
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
    user: AuthUser
}
export type MessageResponse = {
    message: string
}
export type JwtPayload = {
    sub: string
    email: string
}
