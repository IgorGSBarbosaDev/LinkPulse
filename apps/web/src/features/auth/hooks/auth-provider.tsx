import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '../../../shared/api/api-error'
import {
  clearAccessToken,
  getAccessToken,
  SESSION_EXPIRED_EVENT,
  setAccessToken,
} from '../../../shared/lib/auth-token'
import { getMe, login, register } from '../api/auth-api'
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'

const meQueryKey = ['auth', 'me'] as const

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState(() => getAccessToken())
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  const meQuery = useQuery<AuthUser, ApiError>({
    enabled: Boolean(token),
    queryFn: getMe,
    queryKey: meQueryKey,
    retry: false,
  })

  const clearSession = useCallback(() => {
    clearAccessToken()
    setToken(null)
    queryClient.removeQueries({ queryKey: meQueryKey })
  }, [queryClient])

  const loginMutation = useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.accessToken)
      setToken(response.accessToken)
      queryClient.setQueryData(meQueryKey, response.user)
      toast.success('Signed in')
    },
  })

  const registerMutation = useMutation<
    RegisterResponse,
    ApiError,
    RegisterRequest
  >({
    mutationFn: register,
    onSuccess: () => {
      toast.success('Account created. Sign in to continue.')
    },
  })

  const logout = useCallback(() => {
    clearSession()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }, [clearSession, navigate])

  useEffect(() => {
    function handleSessionExpired() {
      clearSession()

      if (location.pathname !== '/login') {
        toast.error('Session expired. Sign in again.')
        navigate('/login', { replace: true, state: { from: location } })
      }
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [clearSession, location, navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      token,
      hasToken: Boolean(token),
      isAuthenticated: Boolean(token && meQuery.data),
      isLoadingSession: Boolean(token) && meQuery.isLoading,
      sessionError: meQuery.error ?? null,
      loginAsync: loginMutation.mutateAsync,
      registerAsync: registerMutation.mutateAsync,
      logout,
      loginError: loginMutation.error ?? null,
      registerError: registerMutation.error ?? null,
      isLoggingIn: loginMutation.isPending,
      isRegistering: registerMutation.isPending,
    }),
    [
      token,
      meQuery.data,
      meQuery.isLoading,
      meQuery.error,
      loginMutation.mutateAsync,
      loginMutation.error,
      loginMutation.isPending,
      registerMutation.mutateAsync,
      registerMutation.error,
      registerMutation.isPending,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
