'use server'

import { getClientIP } from "@/app/Auth/Functions/GetIp"
import db from "@/lib/Database/Supabase/Base"
import { headers } from "next/headers"

const SubScribeAction = async (email?: string, id?: string): Promise<boolean | string> => {
  try {
    let h = await headers()
    let ip = await getClientIP(h)
    if(!ip) return false

    if(!email) return false
    if(!db) return false

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return `You've entered an invalid email address`
    }
    
    // Check device count
    const { count, error: countError } = await db.from('subscribed_users').select('*', { count: 'exact', head: true }).eq('device_id', id)
    if(countError) return false
    if(count && count >= 3) return `Maximum subscription limit (3) reached for this device`

    const { data: emailData, error: emailError } = await db.from('subscribed_users').select('*').eq('email', email).maybeSingle()
    if(emailError) return false
    if(emailData) return `This email has already been subscribed`

    const { error: newError } = await db.from('subscribed_users').insert({
      email,
      device_id: id,
      ip
    })

    console.log(newError)

    if(newError) return false
    
    return true
  }
  catch (e) {
    console.log(e)
    return false
  }
}

export default SubScribeAction
