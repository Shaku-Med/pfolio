'use server'

import { getClientIP } from "@/app/Auth/Functions/GetIp"
import SetToken from "@/app/Auth/IsAuth/Token/SetToken"
import { headers } from "next/headers"

export const GenerateToken = async () => {
  try {
    let h = await headers()
    let ip = await getClientIP(h)
    if(!ip) return null

    let token = await SetToken({
        expiresIn: '1d',
        algorithm: 'HS512',
    }, [`${process.env.COMMENT_POST_TOKEN}`], {
        ip: ip,
    })

    return token
  }
  catch (error) {
    return null
  }
}
