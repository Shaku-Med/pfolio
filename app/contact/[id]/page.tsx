import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getClientIP } from '@/app/Auth/Functions/GetIp'
import SetToken from '@/app/Auth/IsAuth/Token/SetToken'
import Script from 'next/script'
import VerifyToken from '@/app/Auth/Functions/VerifyToken'
import { cookies } from 'next/headers'
import { ChatProvider } from './context/ChatContext'
import Body from './Body/Body'
import { Admin, User } from './context/types'
import { getAdminUser, getChatUser, getMessages } from './server/queries'
import { processMessages } from './server/messageProcessor'
import IsAuth from '@/app/admin/Auth/IsAuth'
import AdminAccess from './Admin/Admin'

type Props = {
  params: Promise<{id: string}>
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
    const { id } = await params
    const userAgent = h.get('user-agent')?.split(/\s+/).join('') || ''
    const clientIP = await getClientIP(h)
    let isAdmin: any = await IsAuth(true)

    if(isAdmin){
      return <AdminAccess isAdmin={isAdmin} id={id}/>
    }

    // Get admin user
    const { data: adminUser, error: adminError } = await getAdminUser()
    if (adminError) {
      console.log(adminError)
      return {
        adminUser: null,
        chatUser: null,
        messages: []
      }
    }
    
    // Get chat user
    const { data: chatUser, error: userError } = await getChatUser(id, userAgent)
    if (userError) {
      console.log(userError)
      return {
        adminUser,
        chatUser: null,
        messages: []
      }
    }

    // Get and process messages
    const { data: messages, error: messagesError } = await getMessages(id)
    if (messagesError) {
      return {
        adminUser,
        chatUser,
        messages: []
      }
    }

    const filteredMessages = await processMessages(messages || [])

    const c = await cookies()
    let verifyT = await VerifyToken(c.get('chat_private_token')?.value, [id, clientIP, `${process.env.ADMIN_LOGIN}`])
    let token

    if(!verifyT) {
      // set a token for the chat
      token = await SetToken({
        expiresIn: `1d`
      }, [id, clientIP, `${process.env.ADMIN_LOGIN}`], {
        user_id: id,
        user_ua: userAgent,
        client_ip: clientIP
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
        <h1 className='text-6xl font-bold py-2'>Error Occurred!</h1>
        <p className='text-gray-500'>Something went wrong</p>
        <Link href='/' className='text-blue-500 border p-2 rounded-md mt-2 hover:bg-muted'>Go back to home</Link>
      </div>
    )
  }
}

export default page
