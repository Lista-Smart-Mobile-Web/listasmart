import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { showAppToast } from './toast'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  timeout: 10_000,
})

let handlingSessionExpiration = false

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const { token, logout } = useAuthStore.getState()
      if (token && !handlingSessionExpiration) {
        handlingSessionExpiration = true
        logout()
        showAppToast('Sessao expirada. Faca login novamente para continuar.', 'error')
        setTimeout(() => {
          handlingSessionExpiration = false
        }, 500)
      }
    }
    return Promise.reject(error)
  }
)

export default api
