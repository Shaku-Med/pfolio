'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  content: string;
  status: 'sending' | 'sent' | 'error';
  timestamp: Date;
}

interface MessageContextType {
  messages: Message[];
  addMessage: (content: string) => string;
  updateMessageStatus: (id: string, status: Message['status']) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (content: string): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      id,
      content,
      status: 'sending',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return id;
  };

  const updateMessageStatus = (id: string, status: Message['status']) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
    );
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage, updateMessageStatus }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}; 