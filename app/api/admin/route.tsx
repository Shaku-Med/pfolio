import { getClientIP } from "@/app/Auth/Functions/GetIp";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const messages = [
        `Nice try man. This route is not for you. \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Please go to this route /admin to login so you can access the admin panel. Oh wait, you don't know the password and you're not in the admin's visinity. \n\n Don't try to perform any attacks, it will be detected, stopped, and reported and you will be banned for life.`,
        `Access Denied! \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt to access the admin panel has been logged. Please note that unauthorized access attempts are monitored and reported.`,
        `Haha, nice try! \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t You think you can just waltz in here? Think again! This area is strictly off-limits to unauthorized users.`,
        `Stop right there! \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted area. Your access attempt has been recorded and will be reviewed by our security team.`,
        `Unauthorized Access Attempt \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your IP and ID have been logged. Further attempts will result in permanent IP ban.`,
        `Security Alert! \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged for security review.`,
        `Not So Fast! \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Your attempt has been recorded and will be investigated.`,
        `Access Blocked \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt to access restricted content has been blocked and logged.`,
        `Security Breach Attempt \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your access attempt has been flagged as suspicious. Further attempts will be reported.`,
        `Restricted Area \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a protected zone. Unauthorized access attempts are not tolerated.`,
        `Warning: Unauthorized Access \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Access Violation \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt to access restricted content has been detected and logged.`,
        `Security Perimeter Breached \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Protected Zone Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is restricted. Your attempt has been logged for security review.`,
        `Access Denied - Security Protocol \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Security Alert - Unauthorized Access \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Restricted Access Zone \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Security Breach Detected \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Access Blocked - Security Protocol \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Protected Area Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`,
        `Security Perimeter Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Access Violation Detected \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Restricted Zone Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Security Alert - Access Denied \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Protected Access Zone \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Security Breach Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`,
        `Access Denied - Security Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Restricted Area Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Security Perimeter Violation \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Protected Zone Violation \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Security Alert - Access Blocked \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Restricted Access Alert \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`,
        `Security Breach Warning \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Access Denied - Protected Zone \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Security Perimeter Warning \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Protected Area Warning \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Security Alert - Restricted Zone \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Access Blocked - Protected Area \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`,
        `Security Breach Notice \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Restricted Zone Notice \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Security Perimeter Notice \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Protected Zone Notice \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Security Alert - Access Notice \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Restricted Access Notice \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`,
        `Security Breach Advisory \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Access Denied - Security Advisory \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Security Perimeter Advisory \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Protected Area Advisory \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Security Alert - Restricted Advisory \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Access Blocked - Protected Advisory \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`,
        `Security Breach Message \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been logged.`,
        `Restricted Zone Message \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been recorded. Further attempts will be investigated.`,
        `Security Perimeter Message \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This area is protected. Unauthorized access attempts are monitored.`,
        `Protected Zone Message \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Your attempt has been logged. Please be aware that unauthorized access is prohibited.`,
        `Security Alert - Access Message \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t Unauthorized access attempt detected. Your information has been recorded.`,
        `Restricted Access Message \n \n IP: ${await getClientIP(request.headers)} \n ID - ${(await cookies()).get('id')?.value} \n\n\t This is a restricted zone. Your attempt has been logged for security review.`
    ]
    const message = messages[Math.floor(Math.random() * messages.length)]
    return new Response(new ReadableStream({
        async start(controller) {
            for (let i = 0; i < message.length; i++) {
                controller.enqueue(new TextEncoder().encode(message[i]))
                await new Promise(resolve => setTimeout(resolve, 50))
            }
            controller.close()
        }
    }), {
        status: 403,
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    })
}