'use client'

import React, { useState, useEffect } from 'react'
import { useSocket } from '@/app/context/SocketContext'
import { useTyping } from '@/app/hooks/useTyping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useChat } from '@/app/contact/[id]/context/ChatContext'

interface MessageInputProps {
  roomId: string
  onSendMessage: (message: string) => void
}

const MessageInput = ({ roomId, onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('')
  const { socket } = useSocket()
  const handleTyping = useTyping(roomId)
  const { sendMessage } = useChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      await sendMessage({
        id: crypto.randomUUID(),
        sender_id: socket?.id || '',
        receiver_id: roomId,
        message: message.trim(),
        created_at: new Date().toISOString()
      })
      setMessage('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    handleTyping()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Input
        value={message}
        onChange={handleChange}
        placeholder="Type a message..."
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}

export default MessageInput 