'use server'

import { cookies, headers } from "next/headers";
import Verification from "./Verification";
import { getClientIP } from "./GetIp";
import SetToken from "../IsAuth/Token/SetToken";
import VerifyToken from "./VerifyToken";
import IsAuth from "@/app/admin/Auth/IsAuth";

interface VHeaderReturn {
    status?: boolean;
    headerInfo: object;
}

export const VerifyHeaders = async (returnData?: boolean): Promise<boolean|VHeaderReturn> => {
    try {
        let h = await headers()
        // 
        // let url: string = process.env.NODE_ENV === 'production' ? `${process.env.PROD_MODE}` : `${process.env.DEV_MODE}`
        // // 
        // const ipVerify = Verification({
        //     ipAddress: await getClientIP(h)
        // })
        // if(!h.get(`referer`)?.startsWith(url)) return false;
        // // 
        return true;
    }
    catch {
        return false;
    }
}

const SetQuickToken = async (setname?: string, checkfor?: string, keys?: any[], addKeys?: any[], isChat?:boolean, isAdmin?:boolean, isComment?:boolean): Promise<boolean> => {
  try {
    let c = await cookies()
    let h = await headers()
    let ip = await getClientIP(h)
    let au = h.get(`user-agent`)?.split(/\s+/).join('')
    let mainAdmin: any = await IsAuth(true)
    // 
    let vh = await VerifyHeaders()
    if(!vh) return false;
    // Perform The tokenizers here...
    // 
    let admin_token = checkfor || c?.get(`admin_token`)?.value
    if(!admin_token) return false;
    // 
    if(isChat){
      if(!keys|| keys.length < 1){
        keys = [c.get('id')?.value, ip, `${process.env.ADMIN_LOGIN}`]
      }
    }

    if(isComment){
      keys = [`${process.env.COMMENT_POST_TOKEN}`]
    }

    // ADMIn VERIFY TOKEN
    if(isAdmin){
      let userId = c.get('id')?.value
      if(!userId) return false;
      
      const encryptionKeys = [
        process.env.VAPID_PRIVATE_KEY,
        process.env.TOKEN3,
        userId
    ].filter(Boolean)
      keys = encryptionKeys
    }

    // 
    if(!mainAdmin){
      let vrToken = await VerifyToken(`${admin_token}`, keys)
  
      if(!vrToken) return false;
      // 
    }
    
    let ky = [`${au}`, `${ip}`]
    if(addKeys && addKeys.length > 0){
        ky = [...ky, ...addKeys]
    }
    // 
    let session = await SetToken({
      expiresIn: '15s',
      algorithm: 'HS512'
    }, ky)
    // 
    if(!session) return false;
    // 
    c.set(`${setname || `authsession`}`, `${session}`)
    return true;
  }
  catch (e) {
    console.log(e)
    return false;
  }
}

export default SetQuickToken