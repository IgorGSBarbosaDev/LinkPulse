export type AuthUser = {
  id: string
  name: string
  email: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}

export type RegisterResponse = AuthUser & {
  createdAt?: string
}

export type RegisteredUser = AuthUser & {
  emailVerifiedAt: string | null
  createdAt: string
}

export type EmailVerificationRegisterResponse = {
  message: string
  emailVerificationRequired: true
  user: RegisteredUser
}

export type VerifyEmailRequest = {
  token: string
}

export type ResendVerificationEmailRequest = {
  email: string
}

export type MessageResponse = {
  message: string
}
