'use client'

import { ContextProvider } from "@/components/Context/ContextProvider"
import { useContext } from "react"

export const useSocket = () => {
  const context = useContext(ContextProvider)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
} 