import IsAuth from "@/app/admin/Auth/IsAuth";
import { getClientIP } from "@/app/Auth/Functions/GetIp";
import VerifyToken from "@/app/Auth/Functions/VerifyToken";
import { DecryptCombine } from "@/app/Auth/Lock/Combine";
import { encrypt } from "@/app/Auth/Lock/Enc";
import db from "@/lib/Database/Supabase/Base";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        let c = await cookies()
        let h = await headers()
        let userAgent = h.get('user-agent')?.split(/\s+/).join('')
        let ip = await getClientIP(h)
        let isAdmin: any = await IsAuth(true)

        const { searchParams } = new URL(request.url);
        let id = searchParams.get('id')

        if(!id){
          return NextResponse.json({ error: 'No id provided' }, { status: 400 });
        }

        const auth = c.get('chat_private_token')?.value;
        if (!auth) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        if(!isAdmin){
            const verifyAuth = await VerifyToken(auth, [isAdmin ? id : c.get('id')?.value, ip, `${process.env.ADMIN_LOGIN}`]);
            if (!verifyAuth) {
              return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
        }

        if(!db){
            return NextResponse.json({ error: `Oups Something went wrong..` }, { status: 500 });
        }

        let query = db
            .from('chat_users')
            .select('*')
            .eq('user_id', isAdmin ? isAdmin.user_id : c.get('id')?.value);

        if (!isAdmin) {
            query = query.eq('user_ua', userAgent);
        }

        const { data: chatUser, error: userError } = await query.maybeSingle();
    
        if(userError){
          return NextResponse.json({ error: `You're not authorized to make this request` }, { status: 401 });
        }
    
        if(!chatUser){
          return NextResponse.json({ error: `You're not authorized to make this request` }, { status: 401 });
        }


        const value = searchParams.values().next().value;

        if (!value?.trim()) {
            return new NextResponse('No value provided', { status: 400 })
        }

        let url = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${id}/main/${value}`
        let fetch_github = await fetch(url)

        if(!fetch_github.ok){
            return new NextResponse('File not found', { status: 404 })
        }
        
        let file = await fetch_github.arrayBuffer()

        // let keys = `${process.env.SECURE_GITHUB_FILE}`

        // let decrypt = encrypt(file, keys )
        
        // if (!decrypt) {
        //     return new NextResponse(`${file}`, { status: 500 })
        // }

        try {
            // Decode base64 string to binary buffer
            // const decodedContent = Buffer.from(file, 'base64')
            
            let buf = new Uint8Array(file)
            // Return the decoded content as an HLS file
            return new NextResponse(buf, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Content-Disposition': `attachment; filename="${value}"`,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'ETag': `"${id}-${value}"`,
                    'Vary': 'Accept-Encoding'
                }
            });
        } catch (decodeError) {
            console.error('Error decoding base64 content:', decodeError);
            return new NextResponse('Invalid file content', { status: 400 });
        }
    } catch (error) {
        console.error('Error processing file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}