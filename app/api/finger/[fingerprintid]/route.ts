import { NextResponse } from 'next/server';
import db from '@/lib/Database/Supabase/Base';
import { getClientIP } from '@/app/Auth/Functions/GetIp';
import { cookies, headers } from 'next/headers';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';

export async function GET(
  request: Request,
  { params }: { params: Promise<{fingerprintid: string}> }
) {
  let h = await headers()
  let c = await cookies()
  let au = h.get(`user-agent`)?.split(/\s+/).join('')
  let auth = h.get(`authorization`)
  // 
  
  if (!db || !c || !h || !auth) {
    c.delete(`quick_chat_session`)
    return NextResponse.json({ error: `Request failed, please try again later.` }, { status: 500 });
  }

  try {

    let auth_token = auth.split(/\s+/)[1]
    if(!auth_token) {
      c.delete(`quick_chat_session`)
      return NextResponse.json({ error: `You are not allowed to make this request.` }, { status: 401 });
    }

    let verify_auth = await VerifyToken(`${auth_token}`)

    if(!verify_auth) {
      c.delete(`quick_chat_session`)
      return NextResponse.json({ error: `It looks like your request was invalid. Please try again.` }, { status: 401 });
    }

    const { fingerprintid } = await params;
    let ky = [`${au}`, `${await getClientIP(h)}`, `${fingerprintid}`]

    let quick_chat_session = c.get(`quick_chat_session`)?.value

    if(!quick_chat_session) {
      c.delete(`quick_chat_session`)
      return NextResponse.json({ error: `You are not allowed to make this request.` }, { status: 401 });
    }
    
    let vrToken = await VerifyToken(`${quick_chat_session}`, ky)
    if(!vrToken) {
      c.delete(`quick_chat_session`)
      return NextResponse.json({ error: `You are not allowed to make this request.` }, { status: 401 });
    }

    c.delete(`quick_chat_session`)

    // 
    const fingerprint = fingerprintid;
    const ip = await getClientIP(h);
    const userAgent = h.get(`user-agent`)?.split(/\s+/).join('');
    if(!userAgent || !ip) {
      return NextResponse.json({ error: `We need some specific information to complete your request.` }, { status: 400 });
    }

    // Check if fingerprint exists
    const { data: existingUser, error: checkError } = await db
      .from('chat_users')
      .select('*')
      .eq('user_id', fingerprint)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: `Access was not granted. It looks like we are having some issues on our end. Please try again later.` }, { status: 500 });
    }

    if (!existingUser) {
      // Insert new user
      const { error: insertError } = await db
        .from('chat_users')
        .insert({
          user_id: fingerprint,
          user_ua: userAgent,
          ip: ip,
          created_at: new Date().toISOString(),
          is_blocked: false
        });

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Access was granted. You can now start a live chat with me.`,
      requestedDate: new Date().toLocaleString()
    });

  } catch (error) {
    console.error('Fingerprint verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 