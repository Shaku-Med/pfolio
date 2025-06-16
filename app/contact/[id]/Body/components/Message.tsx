'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Message as MessageType } from '../../context/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { MoreVertical, Reply, Copy, Edit, Trash, ArrowUpRight } from 'lucide-react'
import MessageThread from './MessageThread'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useSocket } from '@/app/context/SocketContext'

interface MessageProps {
  message: MessageType
  isOwn: boolean
  onReply: (message: MessageType) => void
  onEdit: (message: MessageType) => void
  onDelete: (message: MessageType) => void
  roomId: string
  messageGrouping?: {
    isFirstInGroup: boolean
    isLastInGroup: boolean
    isMiddleInGroup: boolean
    isSingleMessage: boolean
  }
}

const Message = ({ message, isOwn, onReply, onEdit, onDelete, roomId, messageGrouping }: MessageProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { socket, typingUsers, markMessageAsRead } = useSocket()
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOwn && messageRef.current && message.chat_id) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && message.chat_id) {
            markMessageAsRead(message.chat_id)
          }
        },
        { threshold: 0.5 }
      )

      observer.observe(messageRef.current)
      return () => observer.disconnect()
    }
  }, [isOwn, message.chat_id, markMessageAsRead])

  useEffect(() => {
    if (socket) {
      socket.on('message_status', ({ messageId, status }) => {
        if (messageId === message.chat_id) {
        }
      })
    }
  }, [socket, message.chat_id])

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'HH:mm')
    } catch {
      return ''
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message || ``)
  }

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('highlight-message')
      setTimeout(() => {
        element.classList.remove('highlight-message')
      }, 2000)
    }
  }

  const getBubbleRadius = () => {
    if (!messageGrouping) {
      return isOwn
        ? "rounded-[22px] rounded-br-[6px]"
        : "rounded-[22px] rounded-bl-[6px]"
    }

    const { isFirstInGroup, isLastInGroup, isMiddleInGroup, isSingleMessage } = messageGrouping

    if (isSingleMessage) {
      return isOwn
        ? "rounded-[22px] rounded-br-[6px]"
        : "rounded-[22px] rounded-bl-[6px]"
    }

    if (isFirstInGroup) {
      return isOwn
        ? "rounded-[22px] rounded-tr-[22px]"
        : "rounded-[22px] rounded-tl-[22px]"
    }

    if (isLastInGroup) {
      return isOwn
        ? "rounded-[22px] rounded-tr-[6px]"
        : "rounded-[22px] rounded-tl-[6px]"
    }

    if (isMiddleInGroup) {
      return isOwn
        ? "rounded-[22px] rounded-br-[22px]"
        : "rounded-[22px] rounded-bl-[22px]"
    }

    return isOwn
      ? "rounded-[22px] rounded-tr-[6px]"
      : "rounded-[22px] rounded-tl-[6px]"
  }

  const getMessageSpacing = () => {
    if (!messageGrouping) return "py-1.5"
    
    const { isFirstInGroup, isLastInGroup, isMiddleInGroup, isSingleMessage } = messageGrouping
    
    if (isSingleMessage) return "py-1.5"
    if (isFirstInGroup) return "pt-1.5 pb-0.5"
    if (isLastInGroup) return "pt-0.5 pb-1.5"
    if (isMiddleInGroup) return "py-0.5"
    
    return "py-1.5"
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={messageRef}
          id={`message-${message.chat_id}`}
          className={cn(
            "flex w-full group px-4 transition-all duration-200 rounded-md",
            isOwn ? "justify-end" : "justify-start",
            getMessageSpacing()
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
            <div
              className={cn(
                "max-w-[280px] sm:max-w-[320px] md:max-w-[400px] px-4 py-3 relative shadow-sm transition-all duration-200 group-hover:shadow-md touch-manipulation",
                getBubbleRadius(),
                isOwn
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex flex-col gap-3">
                {message.message_reply && (
                  <Link 
                    href={`/contact/${Cookies.get('id')}/${message.message_reply}`}
                    className={cn(
                      "text-[13px] border-l-4 pl-3 py-1 rounded-r-lg transition-all duration-200 hover:bg-black/5",
                      isOwn 
                        ? "text-primary-foreground/80 border-primary-foreground/30 hover:bg-white/10" 
                        : "text-muted-foreground border-muted-foreground/30"
                    )}
                  >
                    <div className="font-medium mb-1 flex items-center gap-1.5">
                      Replying to message
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                    <div className="text-[12px] opacity-75 line-clamp-2">{message.message_reply}</div>
                  </Link>
                )}
                <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {message.message || ``}
                </div>
                {message.file_object && (
                  <div className={cn(
                    "rounded-xl p-3 backdrop-blur-sm border transition-colors",
                    isOwn 
                      ? "bg-white/10 border-white/20" 
                      : "bg-black/5 border-black/10"
                  )}>
                    <div className={cn(
                      "text-[13px] font-medium",
                      isOwn ? "text-primary-foreground/90" : "text-muted-foreground"
                    )}>
                      {message.file_object.name}
                    </div>
                  </div>
                )}
                {message.message_thread && message.message_thread.length > 0 && (
                  <div className={cn(
                    "mt-2 border-l-4 pl-3 rounded-r-lg",
                    isOwn 
                      ? "border-primary-foreground/30" 
                      : "border-muted-foreground/30"
                  )}>
                    <MessageThread
                      messages={message.message_thread}
                      currentUserId={message.user_id || ''}
                    />
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "absolute -top-1 -right-1 w-7 h-7 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm border shadow-sm",
                      "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                      isOwn 
                        ? "bg-primary-foreground/90 text-primary hover:bg-primary-foreground border-primary-foreground/20" 
                        : "bg-background/90 text-foreground hover:bg-background border-border/20"
                    )}
                  >
                    <MoreVertical className="h-3.5 w-3.5 mx-auto" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-sm">
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  {isOwn && (
                    <DropdownMenuItem onClick={() => onEdit(message)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isOwn && (
                    <DropdownMenuItem
                      onClick={() => onDelete(message)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div
              className={cn(
                "text-[11px] mt-1 px-2 flex items-center gap-1.5 transition-opacity duration-200",
                isOwn 
                  ? "text-muted-foreground/70" 
                  : "text-muted-foreground/70",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                messageGrouping && !messageGrouping.isLastInGroup && !messageGrouping.isSingleMessage ? "opacity-0" : ""
              )}
            >
              <span>{formatTime(message.created_at)}</span>
              {isOwn && (
                <span className="text-[10px] flex items-center">
                  {message.message_status === 'sending' && <span className="opacity-60">Sending...</span>}
                  {message.message_status === 'sent' && <span className="text-blue-500">✓</span>}
                  {message.message_status === 'delivered' && <span className="text-blue-500">✓✓</span>}
                  {message.message_status === 'read' && <span className="text-blue-500">✓✓</span>}
                  {message.message_status === 'error' && <span className="text-red-500">⚠</span>}
                </span>
              )}
              {message.edited && (
                <span className="text-[10px] italic opacity-60">edited</span>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="backdrop-blur-sm">
        <ContextMenuItem onClick={() => onReply(message)}>
          <Reply className="mr-2 h-4 w-4" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </ContextMenuItem>
        {isOwn && (
          <ContextMenuItem onClick={() => onEdit(message)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </ContextMenuItem>
        )}
        {isOwn && (
          <ContextMenuItem
            onClick={() => onDelete(message)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default Message