import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(undefined)
const TOKEN_KEY = 'foodflow-token'
const USER_KEY = 'foodflow-user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  })

  function saveSession(tokenValue, userData) {
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    saveSession(res.token, {
      email: res.email,
      full_name: res.full_name,
      is_admin: res.is_admin,
    })
    return res
  }, [])

  const register = useCallback(async (email, password, full_name) => {
    const res = await api.post('/api/auth/register', { email, password, full_name })
    saveSession(res.token, {
      email: res.email,
      full_name: res.full_name,
      is_admin: res.is_admin,
    })
    return res
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/logout', {}) } catch (_) {}
    clearSession()
  }, [])

  // Handle Google OAuth callback token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    const urlEmail = params.get('email')
    const urlName = params.get('name')
    const urlIsAdmin = params.get('is_admin')
    if (urlToken && urlEmail) {
      saveSession(urlToken, {
        email: urlEmail,
        full_name: urlName || '',
        is_admin: urlIsAdmin === 'True',
      })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      register,
      logout,
      isLoggedIn: !!token,
      isAdmin: user?.is_admin || false,
    }}>
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