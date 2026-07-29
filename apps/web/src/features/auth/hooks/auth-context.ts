import { createContext } from 'react'

import type { ApiError } from '../../../shared/api/api-error'
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  hasToken: boolean
  isAuthenticated: boolean
  isLoadingSession: boolean
  sessionError: ApiError | null
  loginAsync: (payload: LoginRequest) => Promise<LoginResponse>
  registerAsync: (payload: RegisterRequest) => Promise<RegisterResponse>
  logout: () => void
  loginError: ApiError | null
  registerError: ApiError | null
  isLoggingIn: boolean
  isRegistering: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
