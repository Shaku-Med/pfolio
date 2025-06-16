import { cookies } from "next/headers";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Check from "./Quick/Check";
import db from "@/lib/Database/Supabase/Base";
import { getClientIP } from "@/app/Auth/Functions/GetIp";
import { JSX } from "react";
import IsAuth from "@/app/admin/Auth/IsAuth";

interface ContactLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

interface ChatUser {
  user_id: string;
  user_ua: string;
  ip: string;
  created_at: string;
  is_blocked: boolean;
}

const ErrorDisplay: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
        </div>
        <CardTitle className="animate-in slide-in-from-bottom-2 duration-500 delay-100">
          {title}
        </CardTitle>
        <CardDescription className="animate-in slide-in-from-bottom-2 duration-500 delay-200">
          {message}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);

export default async function ContactLayout({
  children,
  params,
}: ContactLayoutProps): Promise<JSX.Element> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("id")?.value;
  const { id: routeId } = await params;
  
  // Check admin status first
  let isAdmin: any = await IsAuth(true)

  if (!sessionId && !isAdmin) {
    return <Check />;
  }

  // Allow admin access to any chat
  if (sessionId !== routeId && !isAdmin) {
    return (
      <ErrorDisplay
        title="Access Denied"
        message="The requested ID does not match your session. Please verify your access credentials."
      />
    );
  }

  // Use admin's session ID if they're accessing as admin
  if(isAdmin) {
    sessionId = routeId;
  }

  const headerList = await headers();
  const userAgent = headerList
    .get("user-agent")
    ?.replace(/\s+/g, "")
    .slice(0, 255);
  const clientIP = await getClientIP(headerList);

  if (!userAgent || !clientIP || !db) {
    return (
      <ErrorDisplay
        title="Verification Failed"
        message="Unable to verify your device information. Please ensure you have a stable connection and try again."
      />
    );
  }

  try {
    const { data: existingUser, error: queryError } = await db
      .from("chat_users")
      .select("*")
      .eq("user_id", sessionId)
      .eq(`user_ua`, userAgent)
      .maybeSingle();

    if (queryError && queryError.code !== "PGRST116") {
    //   console.error("Database query error:", queryError);
      return (
        <ErrorDisplay
          title="Database Error"
          message="Unable to verify your account. Our team has been notified of this issue."
        />
      );
    }

    if (!existingUser && !isAdmin) {
      if (!sessionId) {
        return (
          <ErrorDisplay
            title="Session Error"
            message="Unable to create user: Missing session ID."
          />
        );
      }
      const newUser: Omit<ChatUser, "created_at"> = {
        user_id: sessionId,
        user_ua: userAgent,
        ip: clientIP,
        is_blocked: false,
      };

      const { error: insertError } = await db
        .from("chat_users")
        .insert({
          ...newUser,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        // console.error("User creation error:", insertError);
        return (
          <ErrorDisplay
            title="Account Creation Failed"
            message="We couldn't create your account at this time. Please try again in a few moments."
          />
        );
      }
    }

    return <div className="animate-in fade-in-0 duration-500">{children}</div>;
  } catch (error) {
    // console.error("Unexpected error in ContactLayout:", error);
    return (
      <ErrorDisplay
        title="System Error"
        message="An unexpected error occurred while processing your request. Please try again later."
      />
    );
  }
}