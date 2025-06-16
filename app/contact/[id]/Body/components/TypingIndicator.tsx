'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useSocket } from '@/app/context/SocketContext'

interface TypingIndicatorProps {
  roomId: string
  className?: string
}

const TypingIndicator = ({ roomId, className }: TypingIndicatorProps) => {
  const { typingUsers } = useSocket()
  const typingCount = typingUsers.size

  if (typingCount === 0) return null

  return (
    <div className={cn("text-xs text-muted-foreground animate-pulse", className)}>
      {typingCount === 1
        ? "Someone is typing..."
        : `${typingCount} people are typing...`}
    </div>
  )
}

export default TypingIndicator 