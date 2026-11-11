import { useCallback, useEffect, useMemo, useState } from 'react'
import { refreshSession, setApiAccessToken, type SessionUser } from '@/lib/api'
import * as authService from '@/lib/auth.service'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    try {
      window.localStorage.removeItem('accessToken')
    } catch {
      // A sessão nunca depende de armazenamento do navegador.
    }
    const restore = async () => {
      const session = await refreshSession()
      if (active && session) {
        setUser({ name: session.name, email: session.email, role: session.role })
      }
      if (active) setLoading(false)
    }
    const expire = () => {
      setApiAccessToken(null)
      setUser(null)
    }
    window.addEventListener('aee:session-expired', expire)
    void restore()
    return () => {
      active = false
      window.removeEventListener('aee:session-expired', expire)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const sessionUser = await authService.login(email, password)
    setUser(sessionUser)
    return sessionUser
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // A sessão local deve ser encerrada mesmo se o servidor já tiver expirado o cookie.
    } finally {
      setUser(null)
    }
  }, [])

  const updateProfileName = useCallback((name: string) => {
    setUser((current) => current ? { ...current, name } : current)
  }, [])

  const value = useMemo(() => ({ user, loading, signIn, signOut, updateProfileName }), [user, loading, signIn, signOut, updateProfileName])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
