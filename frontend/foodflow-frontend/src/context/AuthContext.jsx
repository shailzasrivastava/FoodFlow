import { createContext, useContext, useState, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(undefined)
const TOKEN_KEY = 'foodflow-admin-token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [admin, setAdmin] = useState(null)

  const login = useCallback(async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setAdmin(res.username)
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) await api.post('/api/auth/logout', {}, token)
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setAdmin(null)
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
