import React from 'react'
import Link from 'next/link'
import db from '@/lib/Database/Supabase/Base'
import { processMessages } from '../server/messageProcessor'
import { ChatProvider } from '../context/ChatContext'
import { getAdminUser } from '../server/queries'
import { cookies, headers } from 'next/headers'
import { Admin, User } from '../context/types'
import Body from '../Body/Body'
import { getClientIP } from '@/app/Auth/Functions/GetIp'
import VerifyToken from '@/app/Auth/Functions/VerifyToken'
import SetToken from '@/app/Auth/IsAuth/Token/SetToken'
import Script from 'next/script'

interface Peops {
    isAdmin?: {
       user_id?: string
       name?: string
    },
    id: string
}

const getThreadMessages = async (threadIds: string[]) => {
  if (!db) return { data: null, error: new Error('Database not initialized') }

  return await db
    .from('chat_messages')
    .select('*')
    .in('chat_id', threadIds)
    .order('created_at', { ascending: true })
}

export async function getChatUser(userId: string, userAgent: string) {
    if (!db) return { data: null, error: new Error('Database not initialized') }
  
    return await db
      .from('chat_users')
      .select('user_id, active, status')
      .eq('user_id', userId)
      .maybeSingle()
  }

const AdminAccess = async({isAdmin, id}: Peops) => {
  try {
      let h = await headers()
      let c = await cookies()
      let clientIp = await getClientIP(h)

      let userAgent = h.get('user-agent')?.split(/\s+/).join('') || ''
      if(!db) {
        return (
          <div>
            <h1>Error</h1>
            <p>Database not initialized</p>
            <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
          </div>
        )
      }

      const { data: messages, error: messagesError } = await db
        .from('chat_messages')
        .select('*')
        .or(`user_id.eq.${id},to_id.eq.${id}`)
        .order('created_at', { ascending: false })
        .limit(50)


      if(messagesError) {
        return (
          <div>
            <h1>Error</h1>
            <p>Failed to fetch messages</p>
            <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
          </div>
        )
      }

      const processedMessages = await processMessages(messages || [])
      

      let {data: AdminUser, error: AdminUserError} = await getAdminUser()
      let {data: chatUser, error: chatUserError} = await getChatUser(isAdmin?.user_id || '', userAgent)
      
      if(chatUserError || AdminUserError || !chatUser || !AdminUser) {
        return (
          <div>
            <h1>Error</h1>
          </div>
        )
      }

      let verifyT = await VerifyToken(c.get('chat_private_token')?.value, [id, clientIp, `${process.env.ADMIN_LOGIN}`])
      let token
  
      if(!verifyT) {
        // set a token for the chat
        token = await SetToken({
          expiresIn: `1d`
        }, [id, clientIp, `${process.env.ADMIN_LOGIN}`], {
          user_id: id,
          user_ua: userAgent,
          client_ip: clientIp
        })
      
        if(!token) {
          return (
            <div className='flex justify-center items-center h-screen flex-col'>
              <h1 className='text-6xl font-bold py-2'>Error Occurred!</h1>
              <p className='text-gray-500'>This chat cannot be started. We had trouble setting up your chat. Please try emailing me at <Link href='mailto:medzyamara@gmail.com' className='text-blue-500'>medzyamara@gmail.com</Link>.</p>
              <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
            </div>
          )
        }
      }

      return (
        <>
          <ChatProvider>
            <Body 
                msg={processedMessages}
                currentUser={chatUser as User}
                admin={AdminUser as Admin}
                isAdmin={isAdmin?.user_id ? {
                  user_id: isAdmin?.user_id,
                  id: id
                } : null}
            />
        </ChatProvider>

        {
          !verifyT && (
            <Script>
              {
                `
                  if(typeof window !== 'undefined'){
                    document.cookie = \`chat_private_token=${token}; path=/; max-age=86400\`
                  }
                `
              }
            </Script>
          )
        }
        </>
      )
  }
  catch (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>Something went wrong</p>
        <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
      </div>
    )
  }
}

export default AdminAccess
