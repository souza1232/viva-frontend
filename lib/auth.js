'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('viva_token')
    if (token) {
      getProfile()
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem('viva_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function saveAuth(token, userData) {
    localStorage.setItem('viva_token', token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('viva_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, saveAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
