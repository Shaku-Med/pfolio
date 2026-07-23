import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/supabase";
import { decryptWithWrapper } from "@/lib/crypto";
import { startSession } from "@/lib/session";
import { clientIp, isSameOrigin, jsonError, rateLimit, readJson } from "@/lib/http";

const MAX_FIELD = 512;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  if (!rateLimit(`login:${clientIp(request)}`, 5, 15 * 60 * 1000)) {
    return jsonError("Too many attempts. Wait a few minutes and try again.", 429);
  }

  const body = await readJson(request);
  if (!body) return jsonError("Bad request", 400);

  const wrapper = typeof body.wrapper === "string" ? body.wrapper.trim() : "";
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (wrapper.length < 16 || wrapper.length > MAX_FIELD) {
    return jsonError("That did not work. Check your wrapper key and password.", 401);
  }
  if (!password || password.length > MAX_FIELD) {
    return jsonError("That did not work. Check your wrapper key and password.", 401);
  }

  const { data, error } = await db().from("admin").select("encrypted_password").limit(1);
  if (error || !data || data.length === 0) {
    return jsonError("No admin account exists yet. Create one with the CLI first.", 401);
  }

  const encrypted = data[0].encrypted_password as string | null;
  if (!encrypted) return jsonError("That did not work. Check your wrapper key and password.", 401);

  let storedHash: string;
  try {
    storedHash = decryptWithWrapper(encrypted, wrapper);
  } catch {
    return jsonError("That did not work. Check your wrapper key and password.", 401);
  }

  let ok = false;
  try {
    ok = await bcrypt.compare(password, storedHash);
  } catch {
    ok = false;
  }
  if (!ok) return jsonError("That did not work. Check your wrapper key and password.", 401);

  await startSession();
  return NextResponse.json({ ok: true });
}
