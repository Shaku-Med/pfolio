'use client'

import React, { createContext, useState, useContext } from 'react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}

interface ChatContextType {
  messages: Message[]
  loading: boolean
  error: string | null
  sendMessage: (data: Message) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  replyToMessage: (messageId: string) => void
  replyingTo: Message | null
  cancelReply: () => void
  setMessages: (messages: Message[]) => void
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const replyToMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setReplyingTo(message)
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const sendMessage = async (data: Message) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const newMessage = await response.json()
      setMessages(prev => [...prev, newMessage])
      setReplyingTo(null) // Clear reply after sending
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (err) {
      console.error('Error deleting message:', err)
      setError('Failed to delete message')
    }
  }

  const editMessage = async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to edit message')
      }

      const updatedMessage = await response.json()
      setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m))
    } catch (err) {
      console.error('Error editing message:', err)
      setError('Failed to edit message')
    }
  }

  return (
    <ChatContext.Provider value={{
      messages,
      loading,
      error,
      sendMessage,
      deleteMessage,
      editMessage,
      replyToMessage,
      replyingTo,
      cancelReply,
      setMessages
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 