import db from '@/lib/Database/Supabase/Base'

export async function getSubscribedUsers() {
  try {
    if (!db) {
      console.error('Database connection not available')
      return null
    }

    const { data, error } = await db
      .from('subscribed_users')
      .select('ip, device_id, email, created_at, active')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching subscribed users:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getSubscribedUsers:', error)
    return null
  }
} 