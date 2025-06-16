import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import SEO from "@/helper/seo";
import './globals.css'
import ViewportManager from './components/ViewportManager';
import CustomCursor from './components/CustomCursor';
import Theme from './components/Theme';
import { ContextProviderWrapper } from "@/components/Context/ContextProvider";
import NavProvider from "@/components/Context/NavProvider";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "@/app/components/Context/ChatContext";
import { EncryptCombine } from "./Auth/Lock/Combine";
import { getClientIP } from "./Auth/Functions/GetIp";
import { encrypt } from "./Auth/Lock/Enc";
import { MessageProvider } from "@/context/MessageContext";
import MessageStatus from "@/components/ui/MessageStatus";
import IsAuth from "./admin/Auth/IsAuth";

export const metadata: Metadata = {...SEO()}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif']
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['monospace']
});

export const viewport: Viewport = {
  maximumScale: 1,
  initialScale: 1,
  width: 'device-width',
  userScalable: false,
  viewportFit: 'cover'
}

let GetSocketToken = async (h: any) => {
  try {
    let ip = await getClientIP(h)
    let authorization = EncryptCombine([`${ip}`], [`${process.env.REQUEST_TOKEN}`], {
      expiresIn: `5m`,
      algorithm: `HS512`
    })
    if(!authorization){
      return null
    }

    let f = await fetch(`${process.env.ACCESS_URL}/token`, {
      method: `GET`,
      headers: {
        'authorization': `Bearer ${authorization}`,
        ...Object.fromEntries(h.entries())
      },
    })
    let d = await f.json()
    if(f.ok){
      return d.token
    }
    else {
      return null
    }
  }
  catch (e) {
    // console.log(e)
    return null
  }
}

export default async function RootLayout({
  children,
  nav,
  footer,
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
  footer: React.ReactNode;
}) {
  let c = await cookies()
  let h = await headers()
  let theme: 'light' | 'dark' | 'system' = 'system'
  // 
  let socketAuth = EncryptCombine({
    ua: h.get('user-agent')?.split(/\s+/).join(''),
    ip: await getClientIP(h)
  }, [process.env.SOCKET_ID], {
    expiresIn: `10m`,
    algorithm: 'HS512'
  })
  let socketToken = await GetSocketToken(h)

  let isAdmin: any = await IsAuth(true)
  let user_id = isAdmin ? isAdmin?.user_id : c.get('id')?.value

  return (
    <html suppressHydrationWarning suppressContentEditableWarning lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} ${theme} overflow-x-hidden antialiased`}>
          <ContextProviderWrapper socketToken={socketToken} socketAuth={socketAuth} user_id={user_id}>
            <ChatProvider>
              <MessageProvider>
                <NavProvider/>
                <Theme theme={theme} />
                <CustomCursor />
                {/* <ViewportManager /> */}
                {nav}
                {children}
                {footer}
                <MessageStatus />
              </MessageProvider>
            </ChatProvider>
          </ContextProviderWrapper>
        <Toaster theme={`${theme}`} style={{
          zIndex: `100000000000001`
        }} richColors position={`bottom-center`}/>
      </body>
    </html>
  );
}