import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { sessionSecret } from "./env";

export const SESSION_COOKIE = "pfolio_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

// Server side record of live sessions, so logging out revokes the token instead
// of only deleting the cookie. Kept on globalThis so every route shares it.
// A restart signs everyone out, which is fine for a local admin tool.
const store = globalThis as typeof globalThis & { __pfolioSessions?: Map<string, number> };
const activeSessions = (store.__pfolioSessions ??= new Map<string, number>());

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function parseToken(token: string | undefined): { id: string; expiresAt: number } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expires, id, provided] = parts;

  const a = Buffer.from(provided);
  const b = Buffer.from(sign(`${expires}.${id}`));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  return { id, expiresAt };
}

function pruneExpired(now: number): void {
  for (const [id, expiresAt] of activeSessions) if (expiresAt <= now) activeSessions.delete(id);
}

export async function startSession(): Promise<void> {
  const now = Date.now();
  pruneExpired(now);
  const id = randomBytes(24).toString("base64url");
  const expiresAt = now + MAX_AGE_SECONDS * 1000;
  activeSessions.set(id, expiresAt);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${expiresAt}.${id}.${sign(`${expiresAt}.${id}`)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const session = parseToken(jar.get(SESSION_COOKIE)?.value);
  if (session) activeSessions.delete(session.id);
  jar.delete(SESSION_COOKIE);
}

export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  const session = parseToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) return false;
  const expiresAt = activeSessions.get(session.id);
  return expiresAt !== undefined && expiresAt > Date.now();
}
