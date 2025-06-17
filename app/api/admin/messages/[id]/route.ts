import { NextResponse } from 'next/server'
import db from '@/lib/Database/Supabase/Base'
import { cookies, headers } from 'next/headers';
import { getClientIP } from '@/app/Auth/Functions/GetIp';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';
import IsAuth from '@/app/admin/Auth/IsAuth';

async function validateRequest() {
  const headersList = await headers();
  let c = await cookies()
  let ip = await getClientIP(headersList)
  let userAgent = headersList.get('user-agent')?.split(/\s+/)?.join('')
  let isAdmin: any = await IsAuth(true)
  
  if(!isAdmin){
    return { error: 'Request not allowed.', status: 401 };
  }

  let message_token = c.get('message')?.value
  c.delete('message')
  
  if(!message_token){
    return { error: 'Your access token is invalid. Please try again.', status: 401 };
  }

  let verifyMessageToken = await VerifyToken(`${message_token}`, [headersList.get('user-agent')?.split(/\s+/)?.join(''), ip])

  if(!verifyMessageToken){
    return { error: `Access was not granted. Please try again.`, status: 401 };
  }

  const auth = c.get('chat_private_token')?.value;
  if (!auth) {
    return { error: 'Unauthorized', status: 401 };
  }

  if(!isAdmin){
    const verifyAuth = await VerifyToken(auth, [c.get('id')?.value, ip, `${process.env.ADMIN_LOGIN}`]);
    if (!verifyAuth) {
      return { error: 'Invalid token', status: 401 };
    }
  }

  if (!db) {
    return { error: 'connection failed', status: 500 };
  }

  let query = db
    .from('chat_users')
    .select('*')
    .eq('user_id', isAdmin ? isAdmin?.user_id : c.get('id')?.value);

  if (!isAdmin) {
    query = query.eq('user_ua', userAgent);
  }

  const { data: chatUser, error: userError } = await query.maybeSingle();

  if(userError || !chatUser){
    return { error: `You're not authorized to make this request`, status: 401 };
  }

  return { 
    success: true, 
    chatUser,
    cookies: c,
    headers: headersList,
    ip,
    userAgent
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{id: string}> }
) {
  try {
    const validation = await validateRequest();
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    let { message, id, chat_id } = await request.json()

    const { data: updatedMessage, error: updateError } = await db!
      .from('chat_messages')
      .update({
        message: message,
        edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', validation.chatUser.user_id)
      .eq('chat_id', chat_id)

    if (updateError) {
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    if (!message) {
      return new NextResponse('Message not found', { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error in PATCH /api/chat/messages/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{id: string}> }
) {
  try {
    const validation = await validateRequest();
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const { id } = await params

    // First, get the message to check for thread messages
    const { data: message, error: messageError } = await db!
      .from('chat_messages')
      .select('message_thread')
      .eq('user_id', validation.chatUser.user_id)
      .eq('chat_id', id)
      .maybeSingle();

    if (messageError) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // If the message has thread messages, delete them first
    if (message?.message_thread && Array.isArray(message.message_thread) && message.message_thread.length > 0) {
      const { error: threadDeleteError } = await db!
        .from('chat_messages')
        .delete()
        .in('chat_id', message.message_thread);

      if (threadDeleteError) {
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }

    // Delete the main message
    const { error } = await db!
      .from('chat_messages')
      .delete()
      .eq('user_id', validation.chatUser.user_id)
      .eq('chat_id', id);

    if (error) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 