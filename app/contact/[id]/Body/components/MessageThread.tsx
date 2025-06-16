import React from 'react'
import { Message as MessageType } from '../../context/types'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import ShowFile from './ShowFile'

interface MessageThreadProps {
  messages: MessageType[]
  currentUserId: string
}

const MessageThread = ({ messages, currentUserId }: MessageThreadProps) => {
  if (!messages || messages.length === 0) return null

  // Get the last 4 messages
  const visibleMessages = messages.slice(-4)
  const remainingCount = messages.length - 4

  return (
    <div className="relative">
      <div className={`flx_col w-full`}>
        <AnimatePresence>
          {visibleMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`w-full flx_col_data`}
            >
              {
                <ShowFile message={message}/>
              }
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MessageThread 