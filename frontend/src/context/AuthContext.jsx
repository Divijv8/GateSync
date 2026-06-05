import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('access_token')
    if (!stored) return null
    const payload = decodeToken(stored)
    return payload ? { username: payload.sub, role: payload.role } : null
  })

  useEffect(() => {
    if (!token) return
    const payload = decodeToken(token)
    if (payload) {
      setCurrentUser({ username: payload.sub, role: payload.role })
    }
  }, [token])

  const login = async (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    localStorage.setItem('access_token', response.data.access_token)
    setToken(response.data.access_token)
    setCurrentUser(response.data.user)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({ token, currentUser, login, logout, isAuthenticated: Boolean(token) }),
    [token, currentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
