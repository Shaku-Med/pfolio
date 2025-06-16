'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
interface AdminContextType {
    isAuth: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  return (
    <AdminContext.Provider
      value={undefined}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdminContext must be used within a AdminProvider')
  }
  return context
} 