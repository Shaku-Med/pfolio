'use client'

import React from 'react'
import { Bell, AlertTriangle, Info, CheckCircle2, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Link from 'next/link'

interface Notification {
  user_id?: string
  title?: string
  description?: string
  read?: boolean
  status?: 'warning' | 'info' | 'success'
  created_at?: string
  id?: string
}

interface NotificationsListProps {
  notifications: Notification[]
  currentPage: number
  totalPages: number
}

export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}

export default function NotificationsList({ notifications, currentPage, totalPages }: NotificationsListProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container mx-auto py-8">
      <Card className='bg-card/60 backdrop-blur-2xl border-none shadow-lg'>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 animate-pulse">
                  {unreadCount} new
                </Badge>
              )}
            </span>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs hover:bg-accent/50">
                Mark all as read
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <BellOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You're all caught up! Check back later for updates.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {notifications.map((notification) => (
                  <Link 
                    key={notification.id}
                    href={`/admin/notifications/${notification.id}`}
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "w-full text-left flex items-start gap-4 p-3 rounded-lg transition-all duration-200",
                        "hover:bg-accent/50 active:bg-accent/70 cursor-pointer",
                        !notification.read && "bg-accent/30"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        notification.status === 'warning' && "bg-yellow-500/20 text-yellow-500",
                        notification.status === 'info' && "bg-blue-500/20 text-blue-500",
                        notification.status === 'success' && "bg-green-500/20 text-green-500"
                      )}>
                        {notification.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {notification.status === 'info' && <Info className="h-4 w-4" />}
                        {notification.status === 'success' && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "font-medium",
                            !notification.read && "text-primary"
                          )}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {notification.created_at ? formatRelativeTime(notification.created_at) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => window.location.href = `?page=${currentPage - 1}`}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => window.location.href = `?page=${page}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => window.location.href = `?page=${currentPage + 1}`}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 