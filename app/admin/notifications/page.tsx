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
import { formatRelativeTime } from '@/lib/utils/time'

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
  searchParams: Promise<{page?: string}>
}) {
  const {page} = await searchParams
  const currentPage = Number(page) || 1
  const { data: notifications, total } = await getNotifications(currentPage)
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return <NotificationsList notifications={notifications} currentPage={currentPage} totalPages={totalPages} />
}
