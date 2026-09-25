import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy, server-only Supabase client. No top-level side effects so the module
 * tree-shakes out of the client bundle. Fails closed: missing env or a browser
 * call throws instead of silently returning empty data.
 */
let cached: SupabaseClient | null = null;

function isPrivilegedKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).role === "service_role";
  } catch {
    return false;
  }
}

function resolveKey(): string {
  const anon = process.env.SUPABASE_ANON_KEY;
  if (anon) {
    if (isPrivilegedKey(anon)) {
      throw new Error("SUPABASE_ANON_KEY holds a service role key. Use the anon key.");
    }
    return anon;
  }

  // The public site should never run with RLS bypassed. Dev tolerates it so the
  // site still boots, but production refuses.
  const fallback = process.env.SUPABASE_KEY;
  if (fallback && process.env.NODE_ENV !== "production") {
    console.warn(
      "[supabase] SUPABASE_ANON_KEY is not set, using SUPABASE_KEY for local dev only. Production will refuse to start like this.",
    );
    return fallback;
  }
  throw new Error("Missing Supabase configuration: set SUPABASE_URL and SUPABASE_ANON_KEY.");
}

function getDb(): SupabaseClient {
  if (cached) return cached;
  if (typeof document !== "undefined") {
    throw new Error("Supabase client must not be used in the browser.");
  }
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error("Missing Supabase configuration: set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }
  cached = createClient(url, resolveKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

const db = /* @__PURE__ */ new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getDb();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default db;
