'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { PusherContext, PusherConfig } from '@/contexts/PusherContext'
import { useAppStore } from '@/store/useAppStore'

interface Props {
  children: React.ReactNode
  pusherConfig?: PusherConfig | null
  isDark?: boolean
}

export function Providers({ children, pusherConfig = null, isDark = false }: Props) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))
  // Initialize Zustand before any child renders so Navbar sees the correct
  // isDark on its first render and doesn't toggle the server-rendered class off.
  useState(() => { useAppStore.setState({ isDark }) })

  return (
    <PusherContext.Provider value={pusherConfig}>
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </PusherContext.Provider>
  )
}
