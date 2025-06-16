import db from "@/lib/Database/Supabase/Base"
import Validate from "../actions/Validate"
import { CreatePassword, VerifyPassword } from "@/app/Auth/Lock/Password";
import { cookies as getCookies, headers as getHeaders } from "next/headers";
import { getClientIP } from "@/app/Auth/Functions/GetIp";
import SetToken from "@/app/Auth/IsAuth/Token/SetToken";

const ATTEMPT_LIMIT = 6;
const BASE_EXPIRATION_HOURS = 24;
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

interface AdminLimit {
    ip: string;
    ua: string;
    device_id: string;
    attempt: number;
    limit: number;
    expires_in: Date;
}

interface AdminUser {
    name: string;
    password: string;
}

export async function POST(request: Request) {
    try {
        const cookies = await getCookies();
        const headers = await getHeaders();
        const userAgent = headers.get('user-agent')?.split(/\s+/).join('') || '';
        const deviceId = cookies.get('id')?.value;
        
        if (!deviceId) {
            return new Response(
                'We need your device ID to continue. Please refresh your page and try again.',
                { status: 400 }
            );
        }

        const ipAddress = await getClientIP(headers);
        const validationResult = await Validate();
        
        if (!validationResult.success) {
            return new Response(validationResult.message, { status: validationResult.status });
        }

        if (!db) {
            return new Response('Database connection failed', { status: 500 });
        }

        const { ipAddress: requestIp, password } = await request.json();

        const { data: adminLimits, error: adminLimitsError } = await checkAdminLimits(
            requestIp,
            deviceId,
            userAgent
        );

        if (adminLimitsError) {
            return new Response('Failed to check attempt limits', { status: 500 });
        }

        if (adminLimits) {
            const isExpired = new Date(adminLimits.expires_in) < new Date();
            
            if (!isExpired && adminLimits.attempt >= adminLimits.limit) {
                return new Response('Too many attempts. Please try again later.', { status: 429 });
            }
        }

        const { data: adminUser, error: adminError } = await db
            .from('admin_main')
            .select('name, password, user_id')
            .eq('ip', requestIp)
            .maybeSingle();

        if (adminError) {
            return new Response('Failed to verify admin credentials', { status: 500 });
        }

        if (!adminUser) {
            return new Response('Invalid credentials', { status: 401 });
        }

        const isPasswordValid = await VerifyPassword(password, adminUser.password);

        if (!isPasswordValid) {
            await handleFailedAttempt(requestIp, deviceId, userAgent, adminLimits);
            return new Response('Invalid credentials', { status: 401 });
        }

        let KEYS = [`${process.env.ADMIN_LOGIN}`, `${deviceId}`, `${process.env.PASS4}`]

        let tokenSet = await SetToken({
            expiresIn: `1d`,
            algorithm: `HS512`,
        }, KEYS, {
            id: deviceId,
            ip: ipAddress,
            ua: userAgent,
            adminUser: adminUser.user_id
        })

        if(!tokenSet) return new Response(`Login failed. Please try again.`, { status: 500 });

        cookies.set(`admin`, `${tokenSet}`, {
            // httpOnly: true,
            // secure: true,
            sameSite: `strict`,
            maxAge: 60 * 60 * 24 * 30,
        })

        return new Response(`Welcome ${adminUser.name}!`, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function checkAdminLimits(ip: string, deviceId: string, userAgent: string) {
    if (!db) throw new Error('Database connection failed');
    
    return await db
        .from('admin_limit')
        .select('*')
        .or(`ip.eq.${ip},device_id.eq.${deviceId},ua.eq.${userAgent}`)
        .maybeSingle();
}

async function handleFailedAttempt(
    ip: string,
    deviceId: string,
    userAgent: string,
    existingLimits: AdminLimit | null
) {
    if (!db) throw new Error('Database connection failed');

    if (!existingLimits) {
        return await db
            .from('admin_limit')
            .insert({
                ip,
                ua: userAgent,
                device_id: deviceId,
                attempt: 1,
                limit: ATTEMPT_LIMIT,
                expires_in: new Date(Date.now() + BASE_EXPIRATION_HOURS * MILLISECONDS_IN_HOUR)
            });
    }

    const now = new Date();
    const isExpired = new Date(existingLimits.expires_in) < now;

    if (isExpired) {
        return await db
            .from('admin_limit')
            .update({
                attempt: 1,
                expires_in: new Date(Date.now() + BASE_EXPIRATION_HOURS * MILLISECONDS_IN_HOUR)
            })
            .or(`ip.eq.${ip},device_id.eq.${deviceId},ua.eq.${userAgent}`);
    }

    const newAttempt = existingLimits.attempt + 1;
    const additionalHours = newAttempt * BASE_EXPIRATION_HOURS;

    return await db
        .from('admin_limit')
        .update({
            attempt: newAttempt,
            expires_in: new Date(Date.now() + (BASE_EXPIRATION_HOURS + additionalHours) * MILLISECONDS_IN_HOUR)
        })
        .or(`ip.eq.${ip},device_id.eq.${deviceId},ua.eq.${userAgent}`);
}