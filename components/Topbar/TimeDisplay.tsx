'use client'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 bg-accent/30 rounded-lg border border-border/50">
      <Clock className="w-3 h-3 text-muted-foreground" />
      <span className="text-xs font-mono text-muted-foreground">{currentTime}</span>
    </div>
  )
} 