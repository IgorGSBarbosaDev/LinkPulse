import axios from 'axios'

import {
  clearAccessToken,
  getAccessToken,
  notifySessionExpired,
} from '../lib/auth-token'
import { env } from '../lib/env'
import { normalizeApiError } from './api-error'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error)

    if (apiError.code === 'UNAUTHORIZED' && getAccessToken()) {
      clearAccessToken()
      notifySessionExpired()
    }

    return Promise.reject(apiError)
  },
)
