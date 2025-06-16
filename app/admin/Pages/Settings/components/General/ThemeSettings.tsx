'use client'
import React from 'react'

const ThemeSettings = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Theme Settings</h2>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Theme Mode</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <select className="bg-background border rounded-md px-3 py-2">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Admin Dashboard Layout</h3>
              <p className="text-sm text-muted-foreground">Choose dashboard layout style</p>
            </div>
            <select className="bg-background border rounded-md px-3 py-2">
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ThemeSettings 