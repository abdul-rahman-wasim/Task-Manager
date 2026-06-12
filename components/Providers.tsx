'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { PusherContext, PusherConfig } from '@/contexts/PusherContext'

interface Props {
  children: React.ReactNode
  pusherConfig?: PusherConfig | null
}

export function Providers({ children, pusherConfig = null }: Props) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <PusherContext.Provider value={pusherConfig}>
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </PusherContext.Provider>
  )
}
