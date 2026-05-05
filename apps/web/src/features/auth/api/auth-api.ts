import { apiClient } from '../../../shared/api/client'
import type {
  AuthUser,
  EmailVerificationRegisterResponse,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  ResendVerificationEmailRequest,
  VerifyEmailRequest,
} from '../types'

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterRequest) {
  const response = await apiClient.post<EmailVerificationRegisterResponse>(
    '/api/v1/auth/register',
    payload,
  )
  return response.data
}

export async function verifyEmail(payload: VerifyEmailRequest) {
  const response = await apiClient.post<MessageResponse>(
    '/api/v1/auth/verify-email',
    payload,
  )
  return response.data
}

export async function resendVerificationEmail(
  payload: ResendVerificationEmailRequest,
) {
  const response = await apiClient.post<MessageResponse>(
    '/api/v1/auth/resend-verification-email',
    payload,
  )
  return response.data
}

export async function getMe() {
  const response = await apiClient.get<AuthUser>('/api/v1/auth/me')
  return response.data
}
