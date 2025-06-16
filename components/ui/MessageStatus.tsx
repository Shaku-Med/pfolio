'use client'
import React from 'react';
import { useMessage } from '@/context/MessageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const MessageStatus: React.FC = () => {
  const { messages } = useMessage();

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-lg p-4 shadow-lg flex items-center space-x-3"
          >
            {message.status === 'sending' && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            {message.status === 'sent' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {message.status === 'error' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm text-foreground">{message.content}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageStatus; 