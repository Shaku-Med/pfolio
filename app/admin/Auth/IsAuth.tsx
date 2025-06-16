import { getClientIP } from "@/app/Auth/Functions/GetIp"
import VerifyToken from "@/app/Auth/Functions/VerifyToken"
import db from "@/lib/Database/Supabase/Base"
import { cookies, headers } from "next/headers"

const IsAuth = async (returnData?: boolean): Promise<boolean | object> => {
  try {
    let c = await cookies()
    let h = await headers()
    // 
    let au = h.get(`user-agent`)?.split(/\s+/)?.join(``)
    let id = c.get(`id`)?.value
    let ip = await getClientIP(h)

    if(!id || !ip || !au) return false

    let admin_token = c.get(`admin`)?.value
    if(!admin_token) return false

    let KEYS = [`${process.env.ADMIN_LOGIN}`, `${id}`, `${process.env.PASS4}`].filter(Boolean)

    let verify_token = await VerifyToken(`${admin_token}`, KEYS, true)
    if(!verify_token) return false

    if(verify_token?.id !== id) return false

    if(!db) return false;

    let { data: admin_user, error: admin_error } = await db
      .from(`admin_main`)
      .select(`name, user_id, role, is_active, created_at`)
      .eq(`user_id`, verify_token.adminUser)
      .maybeSingle()

    if(admin_error) return false
    if(!admin_user) return false

    if(returnData) return admin_user

    return true
  }
  catch {
    return false
  }
}

export default IsAuth
