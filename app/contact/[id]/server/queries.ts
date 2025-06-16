import db from '@/lib/Database/Supabase/Base'

export async function getAdminUser() {
  if (!db) return { data: null, error: new Error('Database not initialized') }

  return await db
    .from('admin')
    .select('name, email, user_id, status, active, active_history')
    .limit(1)
    .maybeSingle()
}

export async function getChatUser(userId: string, userAgent: string) {
  if (!db) return { data: null, error: new Error('Database not initialized') }

  return await db
    .from('chat_users')
    .select('user_id, active, status')
    .eq('user_id', userId)
    .eq('user_ua', userAgent)
    .maybeSingle()
}

export async function getMessages(userId: string) {
  if (!db) return { data: null, error: new Error('Database not initialized') }

  return await db
    .from('chat_messages')
    .select('*')
    .or(`user_id.eq.${userId},to_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(50)
}

export async function getThreadMessages(threadIds: string[]) {
  if (!db) return { data: null, error: new Error('Database not initialized') }

  return await db
    .from('chat_messages')
    .select('*')
    .in('chat_id', threadIds)
    .order('created_at', { ascending: true })
} 