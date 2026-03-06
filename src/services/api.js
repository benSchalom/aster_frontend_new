import axios from 'axios'
import { API_URL } from '../utils/constants'

const api = axios.create({
  //baseURL: API_URL,
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Injecter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh automatique si token expiré
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refresh}` }
        })
        const newToken = res.data.access_token
        localStorage.setItem('access_token', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api