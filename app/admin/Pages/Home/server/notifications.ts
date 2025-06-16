import IsAuth from '@/app/admin/Auth/IsAuth'
import db from '@/lib/Database/Supabase/Base'

interface Notification {
    user_id?: string
    name?: string
    role?: string
    is_active?: boolean
    created_at?: string
}

export async function getNotifications() {
  try {
    let admin: Notification | boolean = await IsAuth(true)
    if (!admin || typeof admin === 'boolean') {
      return null
    }

    if (!db) {
      console.error('Database connection not available')
      return null
    }

    const { data, error } = await db
      .from('notifications')
      .select('user_id, title, description, read, status, created_at, id')
      .eq('user_id', admin.user_id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching notifications:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getNotifications:', error)
    return null
  }
} 