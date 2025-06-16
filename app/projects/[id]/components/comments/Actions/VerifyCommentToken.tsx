import { getClientIP } from "@/app/Auth/Functions/GetIp"
import VerifyToken from "@/app/Auth/Functions/VerifyToken"
import { cookies, headers } from "next/headers"

export const VerifyCommentToken = async (token: string) => {
    try {
        // 
        let h = await headers()
        let c = await cookies()
        let ip = await getClientIP(h)
        let au = h.get('user-agent')?.split(/\s+/).join('')
        let pc = c.get(`post_comments`)?.value
        
        if(!ip) return null
        if(!token || !pc) return null
        // 
        let verify = await VerifyToken(token, [`${process.env.COMMENT_POST_TOKEN}`], true)
        if(!verify) return null

        const ky: string[] = [`${au}`, `${ip}`]

        let vPC = await VerifyToken(pc, ky)
        if(!vPC) return null

        if(ip !== verify?.ip) return null
        return true
    }
    catch {
        return null
    }
}