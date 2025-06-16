import { NextResponse, userAgent } from 'next/server';
import db from '@/lib/Database/Supabase/Base';
import { cookies, headers } from 'next/headers';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';
import { getClientIP } from '@/app/Auth/Functions/GetIp';
import { Message } from '@/app/contact/[id]/context/types';
import IsAuth from '@/app/admin/Auth/IsAuth';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    let c = await cookies()
    let ip = await getClientIP(headersList)
    let isAdmin: any = await IsAuth(true)
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const chatId = searchParams.get('chat_id');
    // 
    let id = searchParams.get('id')
    const pageSize = 10;

    
    if(!isAdmin){
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
    }


    if (!db) {
      return NextResponse.json({ error: 'connection failed' }, { status: 500 });
    }

    let query = db
        .from('chat_users')
        .select('*')
        .eq('user_id', isAdmin ? isAdmin?.user_id : c.get('id')?.value);

    if (!isAdmin) {
        query = query.eq('user_ua', userAgent);
    }

    const { data: chatUser, error: userError } = await query.maybeSingle();

    if(userError){
      return NextResponse.json({ error: `You're not authorized to make this request` }, { status: 401 });
    }

    // Build the base query
    let queryMessages = db.from(`chat_messages`)
      .select(`*`, { count: 'exact' })
      .eq(`message_type`, `file`)
      .or(`user_id.eq.${isAdmin ? id : c.get('id')?.value},to_id.eq.${isAdmin ? id : c.get('id')?.value}`);

    if (chatId) {
      queryMessages = queryMessages.eq('chat_id', chatId);
    }

    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: messages, error: messagesError, count } = await queryMessages
      .range(from, to)
      .order('created_at', { ascending: false });

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / pageSize),
        totalItems: count,
        pageSize
      }
    });

  } catch (error) {
    console.error('Error in message submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 