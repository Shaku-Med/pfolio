import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import db from '@/lib/Database/Supabase/Base'
import { getClientIP } from '@/app/Auth/Functions/GetIp'
import SetToken from '@/app/Auth/IsAuth/Token/SetToken'
import Script from 'next/script'
import VerifyToken from '@/app/Auth/Functions/VerifyToken'
import { cookies } from 'next/headers'
import { ChatProvider } from '@/app/components/Context/ChatContext'
import Body from '@/app/contact/[id]/Body/Body'
import { Admin, User } from '@/app/contact/[id]/context/types'

type Props = {
  params: Promise<{ id: string, individual_id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Live Chat (👋)`,
    description: `Say hi to Mohamed Amara from your own live chat Id: 😉`,
    openGraph: {
      title: `Live Chat (👋)`,
      description: `Say hi to Mohamed Amara from your own live chat Id: 😉`,
      type: 'website',
    },
  }
}

const page = async ({ params }: Props) => {
  try {
    const h = await headers()
    const { id, individual_id } = await params
    const userAgent = h.get('user-agent')?.split(/\s+/).join('')
    const clientIP = await getClientIP(h)

    if (!db) {
      throw new Error('Database connection not available')
    }

    // Get admin user
    const { data: adminUser, error: adminError } = await db
      .from('admin')
      .select('name, email, user_id, status, active, active_history')
      .limit(1)
      .maybeSingle()

    if (adminError) {
      console.log(adminError)
      throw new Error('Failed to fetch admin user')
    }
    
    // Get chat user
    const { data: chatUser, error: userError } = await db
      .from('chat_users')
      .select('user_id, active, status')
      .eq('user_id', id)
      .eq('user_ua', userAgent)
      .maybeSingle()

    if (userError) {
      console.log(userError)
      throw new Error('Failed to fetch chat user')
    }

    // Get paginated messages
    const { data: messages, error: messagesError } = await db
      .from('chat_messages')
      .select('*')
      .or(`user_id.eq.${id},to_id.eq.${id}`)
      .order('created_at', { ascending: false })
      .eq('chat_id', individual_id)
      .limit(50)

    if (messagesError) {
      throw new Error('Failed to fetch messages')
    }

    // Process messages to include thread messages
    const processedMessages = await Promise.all((messages || []).map(async (msg) => {
      try {
        const thread = msg.message_thread;
        if (!thread || !db) return { ...msg, message_thread: [] };

        // Parse thread IDs
        const threadIds = typeof thread === 'string' ? JSON.parse(thread) : thread;
        if (!Array.isArray(threadIds)) return { ...msg, message_thread: [] };

        // Fetch thread messages
        const { data: threadMessages, error: threadError } = await db
          .from('chat_messages')
          .select('*')
          .in('chat_id', threadIds)
          .order('created_at', { ascending: true });

        if (threadError) {
          console.error('Error fetching thread messages:', threadError);
          return { ...msg, message_thread: [] };
        }

        return {
          ...msg,
          message_thread: threadMessages || []
        };
      } catch (e) {
        console.error('Error processing message thread:', e);
        return { ...msg, message_thread: [] };
      }
    }));

    // Filter out messages that are part of a thread
    const allThreadIds = new Set();
    processedMessages.forEach(msg => {
      const thread = msg.message_thread;
      if (Array.isArray(thread)) {
        thread.forEach(threadMsg => allThreadIds.add(threadMsg.chat_id));
      }
    });

    const filteredMessages = processedMessages.filter(msg => !allThreadIds.has(msg.chat_id));

    // Sort all messages by created_at
    filteredMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const c = await cookies()
    let verifyT = await VerifyToken(c.get('chat_private_token')?.value, [id, clientIP, `${process.env.ADMIN_LOGIN}`])
    let token;

    if(!verifyT){
          // set a token for the chat
          token = await SetToken({
            expiresIn: `1d`
          }, [id, clientIP, `${process.env.ADMIN_LOGIN}`], {
            user_id: id,
            user_ua: userAgent,
            client_ip: clientIP
          })
      
          if(!token){
            return (
              <div className='flex justify-center items-center h-screen flex-col'>
                <h1 className='text-6xl font-bold py-2'>Error Occured!</h1>
                <p className='text-gray-500'>This chat can not be started. We had toubles setting up your chat. Please try emailing me at <Link href='mailto:medzyamara@gmail.com' className='text-blue-500'>medzyamara@gmail.com</Link>.</p>
                <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
              </div>
            )
          }
    }

    return (
      <>
        <ChatProvider>
          <Body 
            msg={filteredMessages}
            currentUser={chatUser as User}
            admin={adminUser as Admin}
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
      <div className='flex justify-center items-center h-screen flex-col'>
        <h1 className='text-6xl font-bold py-2'>Error Occured!</h1>
        <p className='text-gray-500'>Something went wrong</p>
        <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
      </div>
    )
  }
}

export default page
