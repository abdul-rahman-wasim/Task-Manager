'use client'

import { createContext, useContext } from 'react'

export interface PusherConfig {
  key: string
  cluster: string
}

export const PusherContext = createContext<PusherConfig | null>(null)
export const usePusherConfig = () => useContext(PusherContext)
