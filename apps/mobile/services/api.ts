import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  timeout: 10_000,
})
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// TODO: adicionar interceptor de response para tratar 401 (token expirado)
// api.interceptors.response.use(res => res, err => {
//   if (err.response?.status === 401) useAuthStore.getState().logout()
//   return Promise.reject(err)
// })

export default api
