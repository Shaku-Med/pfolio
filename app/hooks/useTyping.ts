import { useCallback, useRef } from 'react'
import { useSocket } from '../context/SocketContext'

export const useTyping = (roomId: string) => {
  const { startTyping, stopTyping } = useSocket()
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleTyping = useCallback(() => {
    startTyping(roomId)

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set a new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId)
    }, 2000) // Stop typing after 2 seconds of inactivity
  }, [roomId, startTyping, stopTyping])

  return handleTyping
} 