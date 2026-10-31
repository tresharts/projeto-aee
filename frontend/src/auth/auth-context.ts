import { createContext } from 'react'
import type { SessionUser } from '@/lib/api'

export type AuthContextValue = {
  user: SessionUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<SessionUser>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
