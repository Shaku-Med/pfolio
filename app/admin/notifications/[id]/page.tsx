import React from 'react'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import db from '@/lib/Database/Supabase/Base'
import IsAuth from '@/app/admin/Auth/IsAuth'
import { notFound } from 'next/navigation'

interface Notification {
  user_id?: string
  title?: string
  description?: string
  read?: boolean
  status?: 'warning' | 'info' | 'success'
  created_at?: string
  id?: string
}

async function getNotificationById(id: string) {
  try {
    let admin: any = await IsAuth(true)
    if (!admin || typeof admin === 'boolean') {
      return null
    }

    if (!db) {
      return null
    }

    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', admin.user_id)
      .single()

    if (error || !data) {
      return null
    }

    await db
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', admin.user_id)

    return data
  } catch (error) {
    return null
  }
}

export default async function NotificationPage({ params }: { params: Promise<{id: string}> }) {
  const {id} = await params
  const notification = await getNotificationById(id)

  if (!notification) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <Card className='bg-card/60 backdrop-blur-2xl border-none shadow-lg'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              notification.status === 'warning' && "bg-yellow-500/20 text-yellow-500",
              notification.status === 'info' && "bg-blue-500/20 text-blue-500",
              notification.status === 'success' && "bg-green-500/20 text-green-500"
            )}>
              {notification.status === 'warning' && <AlertTriangle className="h-5 w-5" />}
              {notification.status === 'info' && <Info className="h-5 w-5" />}
              {notification.status === 'success' && <CheckCircle2 className="h-5 w-5" />}
            </div>
            {notification.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">{notification.description}</p>
            <div className="text-sm text-muted-foreground">
              {notification.created_at && new Date(notification.created_at).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
