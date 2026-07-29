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
  createdAt: string
}
