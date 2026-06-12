'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'

type User = { id: string; email: string; role: 'USER' | 'ADMIN'; themePreference: string }
type AuthCtx = { user: User | null; loading: boolean; logout: () => Promise<void> }

const Ctx = createContext<AuthCtx>({ user: null, loading: true, logout: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data?.user ?? null)
        if (data?.user?.themePreference) {
          useAppStore.getState().setDark(data.user.themePreference === 'dark')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return <Ctx.Provider value={{ user, loading, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
