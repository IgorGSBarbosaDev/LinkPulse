import { createContext } from 'react'

import type { ApiError } from '../../../shared/api/api-error'
import type {
  AuthUser,
  EmailVerificationRegisterResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types'

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  hasToken: boolean
  isAuthenticated: boolean
  isLoadingSession: boolean
  sessionError: ApiError | null
  loginAsync: (payload: LoginRequest) => Promise<LoginResponse>
  registerAsync: (payload: RegisterRequest) => Promise<EmailVerificationRegisterResponse>
  logout: () => void
  loginError: ApiError | null
  registerError: ApiError | null
  isLoggingIn: boolean
  isRegistering: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
