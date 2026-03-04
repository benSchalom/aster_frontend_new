import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import api from '../services/api'

export function AuthProvider({ children }) {
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const token = localStorage.getItem('access_token')
  let cancelled = false

  const chargerPro = async () => {
    if (!token) {
      if (!cancelled) setLoading(false)
      return
    }
    try {
      const res = await api.get('/pro/me')
      if (!cancelled) setPro(res.data.pro)
    // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      if (!cancelled) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  chargerPro()
  return () => { cancelled = true }
}, [])

  const login = (accessToken, refreshToken, proData) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    setPro(proData)
  }

  const logout = async () => {
    try {
        await api.post('/auth/logout')
    // eslint-disable-next-line no-unused-vars
    } catch (_e) {
        // Déconnexion locale même si le serveur est indisponible
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setPro(null)
    }

  return (
    <AuthContext.Provider value={{ pro, setPro, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}