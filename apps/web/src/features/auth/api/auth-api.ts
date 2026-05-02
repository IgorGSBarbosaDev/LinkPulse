import { apiClient } from '../../../shared/api/client'
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterRequest) {
  const response = await apiClient.post<RegisterResponse>(
    '/api/v1/auth/register',
    payload,
  )
  return response.data
}

export async function getMe() {
  const response = await apiClient.get<AuthUser>('/api/v1/auth/me')
  return response.data
}
