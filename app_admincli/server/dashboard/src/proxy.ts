import { NextResponse, type NextRequest } from "next/server";

const PORT = "3002";
const ALLOWED_HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

// The dashboard only listens on loopback. Rejecting any other Host header stops
// DNS rebinding, where a malicious site points its own domain at 127.0.0.1.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (!ALLOWED_HOSTS.has(host)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
