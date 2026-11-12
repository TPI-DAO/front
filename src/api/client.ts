import axios from 'axios'
import { tokenStorage } from '@/lib/storage'

export const AUTH_LOGOUT_EVENT = 'auth:logout'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      if (!url.includes('/auth/token')) {
        tokenStorage.clear()
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
      }
    }
    return Promise.reject(error)
  },
)
