import { createContext, useContext, useState, useEffect } from 'react'
import { logout as apiLogout, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('charead_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // On mount: if no user in localStorage, try the cookie (e.g. after OAuth redirect)
  useEffect(() => {
    if (!user) {
      getMe()
        .then(res => {
          setUser(res.data.data)
          localStorage.setItem('charead_user', JSON.stringify(res.data.data))
        })
        .catch(() => {}) // Not logged in — that's fine
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('charead_user', JSON.stringify(userData))
  }

  const logout = async () => {
    try { await apiLogout() } catch {}
    setUser(null)
    localStorage.removeItem('charead_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

