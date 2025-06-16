'use client'
import React from 'react'

const GeneralSettings = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Site Title</h3>
              <p className="text-sm text-muted-foreground">Your website's main title</p>
            </div>
            <input type="text" className="bg-background border rounded-md px-3 py-2 w-64" placeholder="Enter site title" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground">Enable maintenance mode for site updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Admin Email</h3>
              <p className="text-sm text-muted-foreground">Primary admin contact email</p>
            </div>
            <input type="email" className="bg-background border rounded-md px-3 py-2 w-64" placeholder="admin@example.com" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default GeneralSettings 