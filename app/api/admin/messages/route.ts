import { NextResponse } from 'next/server';
import db from '@/lib/Database/Supabase/Base';
import { cookies, headers } from 'next/headers';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';
import { getClientIP } from '@/app/Auth/Functions/GetIp';
import { Message } from '@/app/contact/[id]/context/types';
import IsAuth from '@/app/admin/Auth/IsAuth';


export async function POST(request: Request) {
  try {
    const headersList = await headers();
    let c = await cookies()
    let ip = await getClientIP(headersList)
    let userAgent = headersList.get('user-agent')?.split(/\s+/)?.join('')
    let isAdmin: any = await IsAuth(true)

    let message_token = c.get('message')?.value
    c.delete('message')
    // 
    if(!message_token){
      return NextResponse.json({ error: 'Your access token is invalid. Please try again.' }, { status: 401 });
    }

    let verifyMessageToken = await VerifyToken(`${message_token}`, [headersList.get('user-agent')?.split(/\s+/)?.join(''), ip])

    if(!verifyMessageToken){
      return NextResponse.json({ error: `Access was not granted. Please try again.` }, { status: 401 });
    }

    const auth = c.get('chat_private_token')?.value;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if(!isAdmin){
      const verifyAuth = await VerifyToken(auth, [c.get('id')?.value, ip, `${process.env.ADMIN_LOGIN}`]);
      if (!verifyAuth) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

    }

    if (!db) {
      return NextResponse.json({ error: 'connection failed' }, { status: 500 });
    }

    const { data: chatUser, error: userError } = await db
    .from('chat_users')
    .select('*')
    .eq('user_id', isAdmin?.user_id)
    .maybeSingle()


    if(userError || !chatUser){
      return NextResponse.json({ error: `You're not authorized to make this request` }, { status: 401 });
    }

    const body: Message = await request.json();
    body.user_id = isAdmin?.user_id
    // 
    const { data: message, error: messageError } = await db
    .from('chat_messages')
    .insert({...body})

    if(messageError){
      return NextResponse.json({ error: 'Failed to send message' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error in message submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 