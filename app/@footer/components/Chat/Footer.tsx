'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
import { useScrollPosition } from '@/app/hooks/useScrollPosition'
import { useSocket } from '@/app/context/SocketContext'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Send,
  FileText,
  Plus,
  X
} from 'lucide-react'
import { isMobile } from 'react-device-detect'
import { useAppContext } from '@/app/hooks/useContext'
import { useChatContext } from '@/app/components/Context/ChatContext'
import type { UploadedFile } from './Component/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileUploadDialog } from './FileUploadDialog'
import { FilePreviewDialog } from './Component/FilePreviewDialog'
import { FileInterface, Message } from '@/app/contact/[id]/context/types'
import { v4 as uuid } from 'uuid'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { useParams, usePathname } from 'next/navigation'

interface ChatFooterProps {
  message?: string
  onMessageChange?: (message: string) => void
  onSendMessage?: (message: string) => Promise<void>
  onSendVoiceNote?: (blob: Blob) => void
  onAttachFile?: () => void
  onAttachImage?: () => void
  onAttachCamera?: () => void
  onAttachDocument?: () => void
  onEmojiClick?: (emoji: string) => void
  isRecording?: boolean
  placeholder?: string
  disabled?: boolean
}

const ChatFooter: React.FC<ChatFooterProps> = ({
  message: initialMessage = '',
  onMessageChange,
  onSendMessage,
  onAttachImage,
  onAttachCamera,
  onAttachDocument,
  onEmojiClick,
  isRecording = false,
  placeholder = "Type a message",
  disabled = false
}) => {
  const { setInputFocused } = useAppContext()
  const { isView, addMessage, updateMessage, admin, reply, setReply, isAdmin } = useChatContext()
  const { startTyping, stopTyping, sendMessage } = useSocket()
  const [localMessage, setLocalMessage] = useState(initialMessage)
  const [isSending, setIsSending] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  let path = useParams()
  
  useEffect(() => {
    setLocalMessage(initialMessage)
  }, [initialMessage])

  const { isMobileInstalledPortrait } = useDeviceStatus()
  const isScrolled = useScrollPosition(50)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setLocalMessage(value)
    onMessageChange?.(value)
    
    let roomId = isAdmin ? String(path.id) : admin?.user_id || ''
    startTyping(roomId)
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set a new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId)
    }, 2000)
    
    if (textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true })
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if ((localMessage.trim() || selectedFiles.length > 0) && !isSending) {
        handleSend()
      }
    }
  }

  const handleSend = async () => {
    if ((localMessage.trim() || selectedFiles.length > 0) && !isSending) {
      setIsSending(true)
      const messageId = `${uuid().toUpperCase().split(`-`).join(``)}_${new Date().getTime()}`
      try {
        let filterMessage = selectedFiles.flatMap((file: UploadedFile) => file.id)
        const newMessage: Message = {
          chat_id: messageId,
          user_id: isAdmin ? (isAdmin?.user_id || ``) : Cookies.get('id') || ``,
          to_id: isAdmin ? String(path.id) || `` : admin?.user_id || ``,
          message_type: `text`,
          message: localMessage.trim(),
          message_thread: filterMessage || [],
          message_status: 'sent',
          message_reply: `${reply?.chat_id || ``}`,
          created_at: new Date().toISOString(),
        }

        let roomId = isAdmin ? String(path.id) : admin?.user_id || ''

        sendMessage({
          roomId: roomId,
          message: newMessage
        })

        let addM = await addMessage(newMessage)

        if(!addM){
          toast.error(`Failed to save your message. Try again later.`)
          updateMessage(messageId, {
            status: 'error'
          })
          return;
        }

        if(selectedFiles.length > 0){
          let SubmitFiles = async (attempt: number = 0, index: number = 0) => {
            try {
              if(index < selectedFiles.length){
                let newFileMessage: Message = {
                  chat_id: selectedFiles[index].id,
                  user_id: isAdmin ? (isAdmin?.user_id || ``) : Cookies.get('id') || ``,
                  to_id: isAdmin ? String(path.id) || `` : admin?.user_id || ``,
                  message_type: `file`,
                  file_object: {
                    customName: selectedFiles[index].customName,
                    url: selectedFiles[index].chunks.length > 0 ? selectedFiles[index].chunks[0].url : selectedFiles[index].url,
                    size: selectedFiles[index].file.size,
                    type: selectedFiles[index].file.type,
                    lastModified: selectedFiles[index].file.lastModified,
                    name: selectedFiles[index].file.name,
                    totalChunks: selectedFiles[index].chunks.length,
                  },
                  message_status: 'sent',
                  message_reply: `${reply?.chat_id || ``}`,
                  message_thread: [],
                  created_at: new Date().toISOString(),
                }

                sendMessage({
                  roomId: roomId,
                  message: newFileMessage
                })

                let addF = await addMessage(newFileMessage)
                if(!addF){
                  toast.error(`Failed to upload ${selectedFiles[index].file.name}. We're skiping this file.`)
                }
                return await SubmitFiles(attempt, index + 1)
              }
              else {
                return;
              }
            }
            catch {
              if(attempt >= 3){
                toast.error(`Your message was sent but some files were not sent. Try again later.`)
                updateMessage(messageId, {
                  status: 'error'
                })
                return;
              }
              else {
                return await SubmitFiles(attempt + 1, index)
              }
            }
          }
          await SubmitFiles()
        }
        setLocalMessage('')
        setReply(null)
        setSelectedFiles([])

      } catch (error) {
        updateMessage(messageId, {
          status: 'sending'
        })
      } finally {
        setIsSending(false)
      }
    }
  }

  // Fixed function to prevent duplicates
  const handleFilesChange = (files: UploadedFile[]) => {
    console.log(files)
    setSelectedFiles(prev => {
      const newFiles = files.filter(newFile => {
        // Check for duplicates based on file name, size, and last modified date
        return !prev.some(existingFile => 
          existingFile.file.name === newFile.file.name &&
          existingFile.file.size === newFile.file.size &&
          existingFile.file.lastModified === newFile.file.lastModified
        )
      })
      return [...prev, ...newFiles]
    })
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Clear all files function (optional)
  const handleClearAllFiles = () => {
    setSelectedFiles([])
  }

  // Cleanup typing timeout on unmount
  useEffect(() => {
    const timeoutRef = typingTimeoutRef.current
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [typingTimeoutRef])

  return (
    <>
      {isView && (
        <TooltipProvider>
          <footer 
            className={`
              border-t backdrop-blur-3xl bg-background/90 supports-[backdrop-filter]:bg-background/60
              transition-all duration-500 ease-out z-[100] sticky bottom-0 w-full
              ${isMobileInstalledPortrait ? 'pb-[env(safe-area-inset-bottom)] bg-background/95' : ''}
              shadow-[0_-1px_3px_0_rgba(0,0,0,0.02)] border-t-border/50
            `}
          >
            {selectedFiles.length > 0 && (
              <div className="w-full backdrop-blur-2xl bg-background/95 border-t border-border/40 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFiles}
                    className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.file.name}-${file.file.size}-${index}`} className="relative group flex-shrink-0">
                      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/20 p-2 backdrop-blur-sm">
                        <FilePreviewDialog
                          file={file.file}
                          onRemove={() => handleRemoveFile(index)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              {reply && (
                <div className="px-4 py-2 border-t border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Replying to:</span>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {reply.message}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setReply(null)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-end gap-3 px-4 py-4 max-w-7xl mx-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-2xl hover:bg-muted/40 transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setShowFileUpload(true)}
                    disabled={disabled || isSending}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='z-[10000001]'>Attach file</TooltipContent>
              </Tooltip>

              <div className="flex-1 relative">
                <div className="relative rounded-3xl bg-[transparent] ">
                  <Textarea
                    ref={textareaRef}
                    value={localMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder={placeholder}
                    // disabled={disabled || isSending}
                    className="border-0 bg-transparent resize-none text-sm py-3 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-[120px] leading-5 placeholder:text-muted-foreground/60"
                    rows={1}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                  />
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={localMessage.trim() || selectedFiles.length > 0 ? "default" : "ghost"}
                    size="sm"
                    className={`h-11 w-11 rounded-2xl transition-all duration-300 ${
                      localMessage.trim() || selectedFiles.length > 0
                        ? 'bg-primary hover:bg-primary/90 scale-105 shadow-lg shadow-primary/25' 
                        : 'hover:bg-muted/40 hover:scale-105'
                    } active:scale-95`}
                    onClick={handleSend}
                    disabled={(!localMessage.trim() && selectedFiles.length === 0) || disabled || isSending}
                  >
                    <Send className={`h-5 w-5 transition-all duration-200 rotate-50 ${
                      isSending ? 'animate-pulse' : ''
                    } ${localMessage.trim() || selectedFiles.length > 0 ? 'text-primary-foreground' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='z-[10000001]'>Send message</TooltipContent>
              </Tooltip>
            </div>
          </footer>

          <FileUploadDialog
            open={showFileUpload}
            onOpenChange={setShowFileUpload}
            onFilesChange={handleFilesChange}
          />
        </TooltipProvider>
      )}
    </>
  )
}

export default ChatFooter