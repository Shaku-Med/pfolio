import { NextResponse } from "next/server";
import { endSession } from "@/lib/session";
import { isSameOrigin, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);
  await endSession();
  return NextResponse.json({ ok: true });
}
