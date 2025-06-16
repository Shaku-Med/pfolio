'use client'

import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'
import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Admin, Message, Reply } from '@/app/contact/[id]/context/types'
import { toast } from 'sonner'
import { useSocket } from '@/app/context/SocketContext'


interface ChatContextType {
  chatTitle: string
  setChatTitle: (title: string) => void
  isOnline: boolean
  setIsOnline: (status: boolean) => void
  lastSeen: string
  setLastSeen: (time: string) => void
  isTyping: boolean
  setIsTyping: (status: boolean) => void
  messageCount: number
  setMessageCount: (count: number) => void
  isPinned: boolean
  setIsPinned: (status: boolean) => void
  isMuted: boolean
  setIsMuted: (status: boolean) => void
  isArchived: boolean
  setIsArchived: (status: boolean) => void
  isView: boolean
  setisView: (status: boolean) => void
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => Promise<boolean>
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  deleteMessage: (message: Message) => Promise<boolean>
  editMessage: (messageId: string, data: Message) => Promise<boolean | any>
  replyToMessage: (messageId: string, data: Message) => Promise<void>
  setAdmin: (admin: Admin) => void
  admin: Admin | null
  reply: Reply | null
  setReply: (reply: Reply | null) => void
  handleMessageReply: (message: Message) => void
  handleMessageCopy: (message: Message) => void
  handleMessageEdit: (message: Message) => void
  handleMessageDelete: (message: Message) => void
  isAdmin?: any
  setIsAdmin?: (isAdmin: any) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatTitle, setChatTitle] = useState(``)
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(``)
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isPinned, setIsPinned] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isView, setisView] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [reply, setReply] = useState<Reply | null>(null)

  const { socket, sendMessage: socketMessages } = useSocket()
  const [isAdmin, setIsAdmin] = useState<any>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (socket) {

      socket.on('message', (data) => {
        console.log(data)
        let message = data?.message
        if(message){
          setMessages(prevMessages => {
            const messagesWithNew = [...prevMessages, message];
            
            const updatedMessages = messagesWithNew.map((msg: any) => {
              if (msg.message_thread && Array.isArray(msg.message_thread)) {
                const updatedThread = msg.message_thread.map((threadItem: any) => {
                  if (typeof threadItem === 'string' && threadItem === message.chat_id) {
                    return message;
                  }
                  return threadItem;
                });
                return { ...msg, message_thread: updatedThread };
              }
              return msg
            });
                  
            return updatedMessages.filter((v: any) => v.message_type !== 'file');
          });
        }
      })

      socket.on('typing_start', () => {
        setIsTyping(true)
      })

      socket.on('typing_stop', () => {
        setIsTyping(false)
      })

      return () => {
        socket.off('message')
        socket.off('message_status')
        socket.off('typing_start')
        socket.off('typing_stop')
      }
    }
    setAudio(new Audio())
  }, [socket])

  
  let UpdateRequest = (msg: Message, update: Partial<Message>) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.chat_id === msg.chat_id 
          ? { ...message, ...update}
          : message
      )
    )
  }

  const addMessage = async(message: Message) => {
    if(isAdmin){
      message.to_id = isAdmin.id
      message.user_id = isAdmin.user_id
    }

    setMessages(prevMessages => {
      const messagesWithNew = [...prevMessages, message];
      
      const updatedMessages = messagesWithNew.map((msg: any) => {
        if (msg.message_thread && Array.isArray(msg.message_thread)) {
          const updatedThread = msg.message_thread.map((threadItem: any) => {
            if (typeof threadItem === 'string' && threadItem === message.chat_id) {
              return message;
            }
            return threadItem;
          });
          return { ...msg, message_thread: updatedThread };
        }
        return msg
      });
            
      return updatedMessages.filter((v: any) => v.message_type !== 'file');
    });

    UpdateRequest(message, {message_status: 'sending'})

  
    let sr = await SetQuickToken(`message`, `${Cookies.get('chat_private_token')}`, [], [], true)
    if(!sr){
      UpdateRequest(message, {message_status: 'error'})
      return false
    }
    
    const response = await fetch(`/api/${isAdmin ? 'admin' : 'chat'}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    })

    if(!response.ok){
      UpdateRequest(message, {message_status: 'error'})

      if(audio){
        audio.src = `/Sounds/failed.mp3`
        audio.onloadeddata = () => {
          audio.play()
        }
      }

      return false
    }

    UpdateRequest(message, {message_status: 'sent'})

    if(audio){
      audio.src = `/Sounds/sent.mp3`
      audio.onloadeddata = () => {
        audio.play()
      }
    }

    return true
  }

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.chat_id === messageId ? { ...message, ...updates } : message
      )
    )
  }

  const deleteMessage = async (msg: Message) => {
    try {
      if(!window.confirm(`Are you sure you want to delete this message?`)) return false;

      if(isAdmin){
        msg.to_id = isAdmin.id
        msg.user_id = isAdmin.user_id
      }

      let sr = await SetQuickToken(`message`, `${Cookies.get('chat_private_token')}`, [], [], true)
      if(!sr){
        toast.error(`Failed to delete message`)
        return false;
      }

      const response = await fetch(`/api/${isAdmin ? 'admin' : 'chat'}/messages/${msg.chat_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      // Remove message from local state
      setMessages(prevMessages => prevMessages.filter(message => message.chat_id !== msg.chat_id))

      return true;
    } catch (error) {
      console.error('Error deleting message:', error)
      return false;
    }
  }

  const editMessage = async (messageId: string, data: Message) => {
    try {
      if(isAdmin){
        data.to_id = isAdmin.id
        data.user_id = isAdmin.user_id
      }

      UpdateRequest(data, {message: data.message})

      let sr = await SetQuickToken(`message`, `${Cookies.get('chat_private_token')}`, [], [], true)
      if(!sr){
        toast.error(`Failed to edit message`)
        return false;
      }

      const response = await fetch(`/api/${isAdmin ? 'admin' : 'chat'}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          id: messageId,
          chat_id: data.chat_id
        }),
      })

      if (!response.ok) {
        return false;
      }

    } catch (error) {
      return false
    }
  }

  const replyToMessage = async (messageId: string, data: Message) => {
    try {
      if(isAdmin){
        data.to_id = isAdmin.id
        data.user_id = isAdmin.user_id
      }

      let sr = await SetQuickToken(`message`, `${Cookies.get('chat_private_token')}`, [], [], true)
      if(!sr){
        toast.error(`Failed to reply to message`)
        return
      }

      const response = await fetch(`/api/${isAdmin ? 'admin' : 'chat'}/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          parent_message_id: messageId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reply to message')
      }

      const { message: replyMessage } = await response.json()

      // Add the reply to local state
      addMessage({
        ...replyMessage,
        isOwn: true,
        status: 'sent',
      })

    } catch (error) {
      console.error('Error replying to message:', error)
      throw error
    }
  }

  const handleMessageReply = (message: Message) => {
    setReply({
      chat_id: message.chat_id,
      message: message.message,
      who: message.user_id
    })
  }

  const handleMessageCopy = (message: Message) => {
    navigator.clipboard.writeText(message.message || '')
  }

  const handleMessageEdit = (message: Message) => {
    // Set the message to be edited in the reply state
    setReply({
      chat_id: message.chat_id,
      message: message.message,
      who: message.user_id
    })
  }

  const handleMessageDelete = async (message: Message) => {
    if (message.chat_id) {
      await deleteMessage(message)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chatTitle,
        setChatTitle,
        isOnline,
        setIsOnline,
        lastSeen,
        setLastSeen,
        isTyping,
        setIsTyping,
        messageCount,
        setMessageCount,
        isPinned,
        setIsPinned,
        isMuted,
        setIsMuted,
        isArchived,
        setIsArchived,
        isView,
        setisView,
        messages,
        setMessages,
        addMessage,
        updateMessage,
        deleteMessage,
        editMessage,
        replyToMessage,
        setAdmin,
        admin,
        reply,
        setReply,
        handleMessageReply,
        handleMessageCopy,
        handleMessageEdit,
        handleMessageDelete,
        isAdmin,
        setIsAdmin
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
} 