'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CommentsContextType {
  isDesktopOpen: boolean
  isMobileOpen: boolean
  toggleDesktop: () => void
  toggleMobile: () => void
  openDesktop: () => void
  closeDesktop: () => void
  openMobile: () => void
  closeMobile: () => void
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined)

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleDesktop = () => setIsDesktopOpen(prev => !prev)
  const toggleMobile = () => setIsMobileOpen(prev => !prev)
  const openDesktop = () => setIsDesktopOpen(true)
  const closeDesktop = () => setIsDesktopOpen(false)
  const openMobile = () => setIsMobileOpen(true)
  const closeMobile = () => setIsMobileOpen(false)

  return (
    <CommentsContext.Provider value={{ 
      isDesktopOpen, 
      isMobileOpen, 
      toggleDesktop, 
      toggleMobile,
      openDesktop,
      closeDesktop,
      openMobile,
      closeMobile
    }}>
      {children}
    </CommentsContext.Provider>
  )
}

export function useComments() {
  const context = useContext(CommentsContext)
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider')
  }
  return context
} 