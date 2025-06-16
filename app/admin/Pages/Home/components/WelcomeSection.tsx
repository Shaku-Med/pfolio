import React from 'react'
import { Button } from "@/components/ui/button"

const WelcomeSection = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your system today.</p>
      </div>
      <Button className="bg-primary hover:bg-primary/90">
        Generate Report
      </Button>
    </div>
  )
}

export default WelcomeSection 