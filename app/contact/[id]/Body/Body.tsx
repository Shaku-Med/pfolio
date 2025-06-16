'use client'
import React, { useLayoutEffect, useRef, useEffect, useState } from 'react'
import { Admin, Message, User } from '../context/types'
import { useChatContext } from '@/app/components/Context/ChatContext'
import MessageComponent from './components/Message'
import EditMessageDialog from './components/EditMessageDialog'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns'
import GetNewMessages from '../Admin/Actions/GetNewMessages'
import MessageLoader from './components/MessageLoader'

interface BodyProps {
    msg: Message[]
    currentUser: User
    admin: Admin,
    isAdmin?: any
}

interface GroupedMessages {
  [key: string]: Message[]
}

interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const Body = ({ msg, currentUser, admin, isAdmin }: BodyProps) => {
  const {setIsOnline, setLastSeen, setChatTitle, setAdmin, setisView, editMessage, deleteMessage, messages, setMessages, setReply, replyToMessage, setIsAdmin} = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessages>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  useLayoutEffect(() => {
    if(admin.active){
      setIsOnline(admin.active)
      setLastSeen(admin.active_history || ``)
      setChatTitle(admin.name || ``)
      setAdmin(admin)
      setisView(true)
      setIsAdmin?.(isAdmin)
    }
  }, [admin])

  const getDateLabel = (date: Date): string => {
    const now = new Date()
    
    if (isToday(date)) {
      return 'Today'
    }
    
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    
    const daysDiff = differenceInDays(now, date)
    const weeksDiff = differenceInWeeks(now, date)
    const monthsDiff = differenceInMonths(now, date)
    const yearsDiff = differenceInYears(now, date)
    
    if (daysDiff <= 7) {
      return format(date, 'EEEE')
    }
    
    if (weeksDiff === 1) {
      return '1 week ago'
    }
    
    if (weeksDiff < 4) {
      return `${weeksDiff} weeks ago`
    }
    
    if (monthsDiff === 1) {
      return '1 month ago'
    }
    
    if (monthsDiff < 12) {
      return `${monthsDiff} months ago`
    }
    
    if (yearsDiff === 1) {
      return '1 year ago'
    }
    
    return `${yearsDiff} years ago`
  }

  const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
    const grouped: GroupedMessages = {}
    
    messages.forEach(message => {
      if (message.created_at) {
        const messageDate = new Date(message.created_at)
        const dateLabel = getDateLabel(messageDate)
        
        if (!grouped[dateLabel]) {
          grouped[dateLabel] = []
        }
        grouped[dateLabel].push(message)
      }
    })
    
    return grouped
  }

  const getSortedDateKeys = (grouped: GroupedMessages): string[] => {
    const dateKeys = Object.keys(grouped)
    
    return dateKeys.sort((a, b) => {
      const getFirstMessageDate = (key: string) => {
        const firstMessage = grouped[key][0]
        return firstMessage?.created_at ? new Date(firstMessage.created_at) : new Date(0)
      }
      
      const dateA = getFirstMessageDate(a)
      const dateB = getFirstMessageDate(b)
      
      return dateA.getTime() - dateB.getTime()
    })
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      } else {
        window.scrollTo(0, document.documentElement.scrollHeight)
      }
    }, 100)
  }

  const isNearBottom = () => {
    const threshold = 100
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold
  }

  const [hasMSG, setHasMSG] = useState(false)
  useEffect(() => {
    if (msg && msg.length > 0 && !hasMSG) {
      setHasMSG(true)
      const wasNearBottom = isNearBottom()
      setMessages(msg)
      setPaginationInfo(prev => ({
        ...prev,
        total: msg.length,
        totalPages: Math.ceil(msg.length / prev.pageSize)
      }))
      
      // Auto-scroll if user was near bottom or if it's initial load
      if (wasNearBottom || shouldAutoScroll) {
        scrollToBottom()
        setShouldAutoScroll(false)
      }
    }
  }, [msg])

  useEffect(() => {
    if (messages && messages.length > 0) {
      const mainMessages = messages.filter(message => !message.parent_message_id)
      const grouped = groupMessagesByDate(mainMessages)
      setGroupedMessages(grouped)
    }
  }, [messages])

  // Scroll detection to determine if user is manually scrolling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleUserScroll = () => {
      setIsUserScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1000)
    }

    window.addEventListener('scroll', handleUserScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleUserScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const handleReply = async (message: Message) => {
    setReply({
      chat_id: message.chat_id,
      message: message.message,
      who: message.user_id
    })
  }

  const handleEdit = async (message: Message) => {
    setEditingMessage(message)
  }

  const handleSaveEdit = async (editedText: string) => {
    if (editingMessage?.id) {
      try {
        const updatedMessage = {
          ...editingMessage,
          message: editedText,
          edited: true,
          updated_at: new Date().toISOString()
        }
        await editMessage(editingMessage.id, updatedMessage)
        setEditingMessage(null)
      } catch (error) {
        console.error('Error editing message:', error)
      }
    }
  }

  const handleDelete = async (message: Message) => {
    try {
      await deleteMessage(message)
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const getMessageGrouping = (messages: Message[], currentIndex: number) => {
    const currentMessage = messages[currentIndex]
    const prevMessage = currentIndex > 0 ? messages[currentIndex - 1] : null
    const nextMessage = currentIndex < messages.length - 1 ? messages[currentIndex + 1] : null
    
    const isConsecutive = (msg1: Message | null, msg2: Message | null) => {
      if (!msg1 || !msg2) return false
      return msg1.user_id === msg2.user_id
    }
    
    const isFirstInGroup = !isConsecutive(prevMessage, currentMessage)
    const isLastInGroup = !isConsecutive(currentMessage, nextMessage)
    const isMiddleInGroup = !isFirstInGroup && !isLastInGroup
    const isSingleMessage = isFirstInGroup && isLastInGroup
    
    return {
      isFirstInGroup,
      isLastInGroup,
      isMiddleInGroup,
      isSingleMessage
    }
  }

  const renderMessages = () => {
    const sortedDateKeys = getSortedDateKeys(groupedMessages)
    
    return sortedDateKeys.map((dateLabel, key) => {
      const messagesForDate = groupedMessages[dateLabel]
      
      return (
        <div key={key} className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-muted/80 text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-border/20">
              {dateLabel}
            </div>
          </div>

          <div className="space-y-0.5">
            {messagesForDate.map((message, index) => {
              const isOwn = message.user_id === currentUser.user_id
              const grouping = getMessageGrouping(messagesForDate, index)
              
              return (
                <MessageComponent
                  key={index}
                  message={message}
                  isOwn={isOwn}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  roomId={message.chat_id || ''}
                  messageGrouping={grouping}
                />
              )
            })}
          </div>
        </div>
      )
    })
  }

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !messages.length) {
      return
    }
  
    setIsLoadingMore(true)
    try {
      const oldestMessage = messages[messages.length - 1]
      if (!oldestMessage?.created_at || !currentUser.user_id) return
  
      const { data: newMessages, error, pagination } = await GetNewMessages({
        userId: currentUser.user_id,
        lastMessageDate: oldestMessage.created_at,
        page: currentPage + 1,
        pageSize: paginationInfo.pageSize
      })
  
      if (error || !newMessages) {
        console.error('Error loading more messages:', error)
        return
      }
  
      console.log('Pagination response:', pagination)
  
      if (pagination) {
        setPaginationInfo(pagination)
        // Fix: Use the current page we just requested, not pagination.page + 1
        setCurrentPage(currentPage + 1)
        setHasMore(pagination.hasMore)
      }
  
      if (newMessages.length > 0) {
        const container = containerRef.current
        const scrollHeight = container?.scrollHeight || 0
        const scrollTop = container?.scrollTop || 0
  
        setMessages([...newMessages, ...messages])
  
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = scrollTop + (container.scrollHeight - scrollHeight)
          }
        })
      } else {
        // If no new messages returned, assume we've reached the end
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }
  
  const handleScroll = () => {
    if (window.scrollY < 20 && !isLoadingMore && hasMore) {
      loadMoreMessages()
    }
  }
  
  // Fix: Better dependency management and cleanup
  useEffect(() => {
    if (!messages.length) return
  
    const scrollHandler = () => {
      if (window.scrollY < 20 && !isLoadingMore && hasMore) {
        loadMoreMessages()
      }
    }
  
    window.addEventListener('scroll', scrollHandler, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [messages.length, isLoadingMore, hasMore, currentPage]) // Add currentPage as dependency

  return (
    <div className={`flex items-end py-6 justify-center min-h-screen`}>
      <div className={`lg:container w-full py-4 lg:px-35 px-0`} ref={containerRef}>
        {isLoadingMore && (
          <MessageLoader 
            variant="wave" 
            size="md" 
            text="Loading older messages..."
            className="mb-4"
          />
        )}
        {renderMessages()}

      </div>
      <div ref={messagesEndRef} />

      {editingMessage && (
        <EditMessageDialog
          message={editingMessage}
          isOpen={!!editingMessage}
          onClose={() => setEditingMessage(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

export default Body