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
        
        let url = decodeURIComponent(request.url).toString()
        url = url.split(`amp;`).join('')
        // console.log(url)

        const { searchParams } = new URL(url);
        let id = searchParams.get('id')

        if(!id){
          return NextResponse.json({ error: 'No id provided' }, { status: 400 });
        }


        if(!db){
            return NextResponse.json({ error: `Oups Something went wrong..` }, { status: 500 });
        }

        let length = searchParams.get('length')
        let type = searchParams.get('type')
        const value = searchParams.values().next().value;

        if (!value?.trim() || !length || !id) {
            return new NextResponse('No value provided', { status: 400 })
        }

        let psh: any[] = []

        for(let i = 0; i < parseInt(length); i++){
            
            let url = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${id}/main/${value}_${i}`
            let fetch_github = await fetch(url)
    
            if(!fetch_github.ok){
                // console.log(fetch_github)
                return new NextResponse('File not found', { status: 404 })
            }
            
            let file = await fetch_github.arrayBuffer()
            psh.push(new Uint8Array(file))
        }
        
        try {
            // Create a ReadableStream to handle the chunks
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for (const chunk of psh) {
                            controller.enqueue(chunk);
                        }
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                }
            });

            // Return the stream with appropriate headers
            return new NextResponse(stream, {
                headers: {
                    'Content-Type': type || 'application/octet-stream',
                    // 'Content-Disposition': `attachment; filename="${value}"`,
                    'Transfer-Encoding': 'chunked',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'ETag': `"${id}-${value}-${length}"`,
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