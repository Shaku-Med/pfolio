'use client'
import { DeviceFingerprintGenerator } from "@/app/contact/components/NoLibrary/FingerPrint";
import { createContext, ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { Message } from "@/app/contact/[id]/context/types";

interface ContextType {
  theme: string;
  setTheme: (theme: string) => void;
  inputFocused: boolean;
  setInputFocused: (inputFocused: boolean) => void;
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: any;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (data: { roomId: string; message: Message }) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  setTypingUsers: (typingUsers: any) => void;
  socketMessages: Message[];
  fingerPrint: DeviceFingerprintGenerator | null;
}

const defaultContextValue: ContextType = {
  theme: 'light',
  setTheme: () => {},
  inputFocused: false,
  setInputFocused: () => {},
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  markMessageAsRead: () => {},
  typingUsers: null,
  startTyping: () => {},
  stopTyping: () => {},
  setTypingUsers: () => {},
  socketMessages: [],
  fingerPrint: new DeviceFingerprintGenerator()
}

export const ContextProvider = createContext<ContextType>(defaultContextValue);

interface ContextProviderProps {
  children: ReactNode;
  socketToken?: string | null;
  socketAuth?: string | null;
  user_id?: string | null;
}

export const ContextProviderWrapper = ({ children, socketToken, socketAuth, user_id }: ContextProviderProps) => {
  const [theme, setTheme] = useState('light');
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<any>(null);
  const [socketMessages, setSocketMessages] = useState<Message[]>([]);
  const [fingerPrint, setFingerPrint] = useState<DeviceFingerprintGenerator | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize fingerprint when component mounts
    const fingerprintGenerator = new DeviceFingerprintGenerator();
    setFingerPrint(fingerprintGenerator);
  }, []);

  useLayoutEffect(() => {
    try {
      let obJ = async () => {
        try {
          if(!fingerPrint) return;
          const fingerprint = await fingerPrint.generateFingerprint()
          if(!fingerprint){
            return;
          }
          let id = user_id || Cookies.get('id') || fingerPrint.generateUniqueId(fingerprint)

          if(!id){
            return;
          }

          const socket = io('http://192.168.1.92:3001', {
            auth: {
              token: socketToken,
              know_who: id
            },
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            extraHeaders: {
              'Authorization': `Bearer ${socketAuth}`
            },
            query: {
              id
            },
          });

          socket.on('connect', () => {
            setSocket(socket);
            setIsConnected(true)
          });

          socket.on('disconnect', () => {
            socket.connect()
            setIsConnected(false)
            setSocket(socket);
          });

          socket.on('typing_user', (data) => {
            setTypingUsers(data)
          });

          socket.on('message', (data) => {
            setSocketMessages(data?.message)
          })
        }
        catch {
          return;
        }
      }
      // obJ()
    } catch (error) {
      console.error(error);
    }
  }, [fingerPrint])

  
  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join_room', roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave_room', roomId)
    }
  }

  const sendMessage = (data: { roomId: string; message: Message }) => {
    if (socket) {
      socket.emit('message', data)
    }
  }

  const startTyping = (roomId: string) => {
    if (socket && !typingUsers) {
      socket.emit('typing_start', { roomId, status: true })
      setTypingUsers(roomId)
    }
  }

  const stopTyping = (roomId: string) => {
    if (socket && typingUsers) {
      socket.emit('typing_stop', { roomId, status: false })
      setTypingUsers(null)
    }
  }

  const markMessageAsRead = (messageId: string) => {
    if (socket) {
      socket.emit('message_read', { messageId })
    }
  }

  const value = {
    theme,
    setTheme,
    inputFocused,
    setInputFocused,
    socket,
    isConnected,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    setTypingUsers,
    socketMessages,
    fingerPrint
  };

  return (
    <ContextProvider.Provider value={value}>
      {
        isConnected && (
          <div className={`fixed z-[100000000000000000001] top-[-5px] left-[50%] translate-x-[-50%] w-fit bg-chart-2 px-4 text-xs rounded-b-lg text-white`}>
            Connected
          </div>
        )
      }
      {children}
    </ContextProvider.Provider>
  );
};