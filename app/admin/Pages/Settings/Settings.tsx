'use client'
import React from 'react'
import GeneralSettings from './components/General/GeneralSettings'
import SecuritySettings from './components/General/SecuritySettings'
import ThemeSettings from './components/General/ThemeSettings'

const Settings = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
      <GeneralSettings />
      <SecuritySettings />
      <ThemeSettings />
    </div>
  )
}

export default Settings
