import { NextResponse, userAgent } from 'next/server';
import db from '@/lib/Database/Supabase/Base';
import { cookies, headers } from 'next/headers';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';
import { getClientIP } from '@/app/Auth/Functions/GetIp';

export async function GET(
  request: Request,
  { params }: { params: { chat_id: string } }
) {
  try {
    const headersList = await headers();
    let c = await cookies()
    let ip = await getClientIP(headersList)
    const chatId = params.chat_id;

    let message_token = c.get('message')?.value
    c.delete('message')
    
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

    const verifyAuth = await VerifyToken(auth, [c.get('id')?.value, ip, `${process.env.ADMIN_LOGIN}`]);
    if (!verifyAuth) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: 'connection failed' }, { status: 500 });
    }

    const { data: chatUser, error: userError } = await db
    .from('chat_users')
    .select('*')
    .eq('user_id', c.get('id')?.value)
    .eq('user_ua', userAgent)
    .maybeSingle()

    if(userError){
      return NextResponse.json({ error: `You're not authorized to make this request` }, { status: 401 });
    }

    // Get specific file message
    const { data: message, error: messageError } = await db
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('message_type', 'file')
      .or(`user_id.eq.${chatUser?.user_id},to_id.eq.${chatUser?.user_id}`)
      .maybeSingle();

    if (messageError) {
      return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ message });

  } catch (error) {
    console.error('Error in message retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 