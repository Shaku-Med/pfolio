import { getClientIP } from '@/app/Auth/Functions/GetIp';
import VerifyToken from '@/app/Auth/Functions/VerifyToken';
import { cookies, headers } from 'next/headers';

interface ValidateProps {
    status?: number
    message?: any
    success?: boolean
}
const Validate = async (): Promise<ValidateProps> => {
  try {
    let c = await cookies()
    let h = await headers()
    // 
    let id = c.get('id')?.value
    let admin_token = c.get('admin_token')?.value
    let token = h.get('Authorization')?.split(' ')[1]
    let au = h.get('user-agent')?.split(/\s+/)?.join('')
    let ip = await getClientIP(h)
    // 
    c.delete('admin_token')
    if(!id || !admin_token || !token) return { status: 401, message: 'Unauthorized', success: false };

    let verify_token = await VerifyToken(`${admin_token}`, [au, ip])
    if(!verify_token) return { status: 401, message: 'Your request was denied. Please try again.', success: false };

    const encryptionKeys = [
        process.env.VAPID_PRIVATE_KEY,
        process.env.TOKEN3,
        id
        ].filter(Boolean)

    if(encryptionKeys.length !== 3) return { status: 401, message: `Authorization denied. Please try again.`, success: false };
    let token_verify = await VerifyToken(`${token}`, encryptionKeys)
    if(!token_verify) return { status: 401, message: `We were unable to process your request. Please try again later.`, success: false };

    return { status: 200, message: 'Authorized', success: true };
  }
  catch {
    return { status: 500, message: 'Internal Server Error', success: false };
  }
}

export default Validate
