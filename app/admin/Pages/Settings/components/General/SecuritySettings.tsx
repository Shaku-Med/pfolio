'use client'
import React from 'react'

const SecuritySettings = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Security Settings</h2>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Session Timeout</h3>
              <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <select className="bg-background border rounded-md px-3 py-2">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">IP Whitelist</h3>
              <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
            </div>
            <input type="text" className="bg-background border rounded-md px-3 py-2 w-64" placeholder="Enter IP addresses" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecuritySettings 