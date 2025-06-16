
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { decrypt, encrypt } from '@/app/Auth/Lock/Enc'
import { getClientIP } from '@/app/Auth/Functions/GetIp'
import { VerifyHeaders } from '@/app/Auth/Functions/SetQuickToken'
import VerifyToken from '@/app/Auth/Functions/VerifyToken'


export async function POST(request: Request) {
  return redirect('/')
}


export const ReturnResponse = async (status = 401, message = 'Unable to complete your request! Some information are missing.', added = {}, success = false) => {
    try {
        return NextResponse.json({ success, status, message, ...added }, { status })
    } catch {
        return NextResponse.json({ success: false, status: 401, message: 'Unable to complete your request! Some information are missing.', action: null }, { status: 401 })
    }
}

export async function GET() {
    try {
        
        const h = await headers()
        const au = h.get('user-agent')?.split(/\s+/).join('')
        const clientIP = await getClientIP(h)
        const header_v = await VerifyHeaders()
        // 
        const ky: string[] = [`${au}`, `${clientIP}`]
        let k: string[] = [`${process.env.PASS1}`, `${process.env.TOKEN2}`]

        // 
        if (!header_v) return await ReturnResponse(401, 'Something seems not to be working right.')
        
        const c = await cookies()
        const file_token = c?.get('file_token')?.value

        if (!file_token) {
            console.log('No file_token')
            c.delete('file_token')
            return await ReturnResponse()
        }
        
        const vraccess_token = await VerifyToken(`${file_token}`, ky)

        if (!vraccess_token) {
            return await ReturnResponse(500, 'Invalid data provided.')
        }
        
        c.delete('file_token')

        let d = encrypt(`${process.env.FILE_TOKEN}`, `${process.env.KEY_LOCK}+${au}`)
        let f = await fetch(`${process.env.FILE_API}/`, {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json',
                'referer': `${process.env.FILE_API}/`,
                'user-agent': `${au}`,
            },
            cache: 'no-cache',
            body: JSON.stringify({
                token: d
            })
        })

        console.log(f.statusText)
        
        if(!f.ok){
          return await ReturnResponse(f.status, `Access Denied.`)
        }

        return await ReturnResponse(200, 'Token verified successfully.', {...await f.json()}, true)
    } catch (error) {
        console.log(error)
        return await ReturnResponse()
    }
}
