'use client'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
import { useScrollPosition } from '@/app/hooks/useScrollPosition'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ChatDropdown from './ChatDropdown'
import { 
  Search, 
} from 'lucide-react'
import { isMobile } from 'react-device-detect'
import { useAppContext } from '@/app/hooks/useContext'
import { useChatContext } from '@/app/components/Context/ChatContext'
import { ContextProvider } from '@/components/Context/ContextProvider'

interface ChatNavProps {
  onSearch?: () => void
  onTogglePin?: () => void
  onToggleMute?: () => void
  onArchive?: () => void
  onSettings?: () => void
  onShare?: () => void
  onInfo?: () => void
}

const ChatNav: React.FC<ChatNavProps> = ({
  onSearch,
  onTogglePin,
  onToggleMute,
  onArchive,
  onSettings,
  onShare,
  onInfo
}) => {
  let { inputFocused } = useAppContext()
  const { 
    chatTitle,
    isOnline,
    lastSeen,
    isTyping,
    messageCount,
  } = useChatContext()
  const { typingUsers } = useContext(ContextProvider)
  
  const { isMobileInstalledPortrait } = useDeviceStatus()
  const isScrolled = useScrollPosition(50)
  const [showActions, setShowActions] = useState(false)

  const getStatusText = (): string => {
    if(!typingUsers) return ""
    if (typingUsers?.status) return `typing...`
    if (!typingUsers?.status) return ""
    if (isOnline) return `${isOnline ? "Online" : "Offline"}`
    return lastSeen
  }

  const getStatusColor = (): string => {
    if (isTyping) return "text-chart-2"
    if (isOnline) return "text-chart-2"
    return "text-gray-400"
  }

  return (
    <>
      {
        chatTitle.trim() && (
          <TooltipProvider>
            <nav 
              className={`
                ${isMobileInstalledPortrait ? `bg-background/80 backdrop-blur-xl border-b border-border/50` : ` ${!isMobile ? `bg-background/80 backdrop-blur-xl` : `bg-background`}`}
                transition-all duration-500 z-[100] sticky top-0 w-full
                ${(isMobileInstalledPortrait) && isScrolled 
                  ? 'pt-[50px] shadow-lg' 
                  : `${isMobileInstalledPortrait ? 'pt-[50px]' : 'pt-0'}`
                }
              `}
              onMouseEnter={() => setShowActions(true)}
              onMouseLeave={() => setShowActions(false)}
            >
              <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
                
                <div className="flex items-center space-x-3 flex-1 min-w-0">

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-lg font-semibold ">
                        {chatTitle}
                      </h1>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getStatusColor()}`}>
                        {getStatusText()}
                      </span>
                      {messageCount > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {messageCount > 999 ? '999+' : messageCount}
                        </Badge>
                      )}
                      {isTyping && (
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-chart-2 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-chart-2 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1.5 h-1.5 bg-chart-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
              </div>

              {isScrolled && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
              )}
            </nav>
          </TooltipProvider>
        )
      }
    </>
  )
}

export default ChatNav