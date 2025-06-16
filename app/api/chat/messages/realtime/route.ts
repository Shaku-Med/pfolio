import { NextResponse } from 'next/server';
import db from '@/lib/Database/Supabase/Base';
import { cookies, headers } from 'next/headers';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';
import { getClientIP } from '@/app/Auth/Functions/GetIp';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    let c = await cookies();
    let ip = await getClientIP(headersList);
    let userAgent = headersList.get('user-agent')?.split(/\s+/)?.join('');

    const auth = c.get('chat_private_token')?.value;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verifyAuth = await VerifyToken(auth, [c.get('id')?.value, ip, `${process.env.ADMIN_LOGIN}`]);
    if (!verifyAuth) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const lastMessageId = searchParams.get('lastMessageId');
    const userId = c.get('id')?.value;

    // Get new messages since lastMessageId
    const { data: newMessages, error: messagesError } = await db
      .from('chat_messages')
      .select('*')
      .or(`user_id.eq.${userId},to_id.eq.${userId}`)
      .gt('created_at', lastMessageId ? new Date(parseInt(lastMessageId)).toISOString() : new Date(0).toISOString())
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Get updated messages
    const { data: updatedMessages, error: updatedError } = await db
      .from('chat_messages')
      .select('*')
      .or(`user_id.eq.${userId},to_id.eq.${userId}`)
      .gt('updated_at', lastMessageId ? new Date(parseInt(lastMessageId)).toISOString() : new Date(0).toISOString())
      .order('updated_at', { ascending: true });

    if (updatedError) {
      return NextResponse.json({ error: 'Failed to fetch updated messages' }, { status: 500 });
    }

    return NextResponse.json({
      newMessages: newMessages || [],
      updatedMessages: updatedMessages || [],
      timestamp: new Date().getTime()
    });

  } catch (error) {
    console.error('Error in realtime message fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 