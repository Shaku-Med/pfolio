import React from 'react'
import { Bell, AlertTriangle, Info, CheckCircle2, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Link from 'next/link'
import db from '@/lib/Database/Supabase/Base'
import IsAuth from '@/app/admin/Auth/IsAuth'
import NotificationsList from './NotificationsList'

interface Notification {
  user_id?: string
  title?: string
  description?: string
  read?: boolean
  status?: 'warning' | 'info' | 'success'
  created_at?: string
  id?: string
}

const ITEMS_PER_PAGE = 10

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

async function getNotifications(page: number = 1) {
  try {
    let admin: any = await IsAuth(true)
    if (!admin || typeof admin === 'boolean') {
      return { data: [], total: 0 }
    }

    if (!db) {
      console.error('Database connection not available')
      return { data: [], total: 0 }
    }

    // Get total count
    const { count } = await db
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', admin.user_id)

    // Get paginated data
    const { data, error } = await db
      .from('notifications')
      .select('user_id, title, description, read, status, created_at, id')
      .eq('user_id', admin.user_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      return { data: [], total: 0 }
    }

    return { data, total: count || 0 }
  } catch (error) {
    console.error('Error in getNotifications:', error)
    return { data: [], total: 0 }
  }
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = searchParams?.page
  const currentPage = typeof page === 'string' ? Number(page) : 1
  const { data: notifications, total } = await getNotifications(currentPage)
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return <NotificationsList notifications={notifications} currentPage={currentPage} totalPages={totalPages} />
}
