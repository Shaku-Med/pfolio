'use client'

import React from 'react'
import { useSocket } from '@/app/context/SocketContext'
import TypingIndicator from './TypingIndicator'
import MessageInput from './MessageInput'
import Message from './Message'
import Cookies from 'js-cookie'

interface ChatContainerProps {
  roomId: string
  messages: any[]
  onSendMessage: (message: string) => void
}

const ChatContainer = ({ roomId, messages, onSendMessage }: ChatContainerProps) => {
  const { joinRoom, leaveRoom } = useSocket()

  React.useEffect(() => {
    joinRoom(roomId)
    return () => leaveRoom(roomId)
  }, [roomId, joinRoom, leaveRoom])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message
            key={message.chat_id}
            message={message}
            isOwn={message.user_id === Cookies.get('id')}
            onReply={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            roomId={roomId}
          />
        ))}
        <TypingIndicator roomId={roomId} className="mt-2" />
      </div>
      <MessageInput roomId={roomId} onSendMessage={onSendMessage} />
    </div>
  )
}

export default ChatContainer 