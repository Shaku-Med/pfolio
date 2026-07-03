import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy, server-only Supabase client. No top-level side effects so the module
 * tree-shakes out of the client bundle. Fails closed: missing env or a browser
 * call throws instead of silently returning empty data.
 */
let cached: SupabaseClient | null = null;

function getDb(): SupabaseClient {
  if (cached) return cached;
  if (typeof document !== "undefined") {
    throw new Error("Supabase client must not be used in the browser.");
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase configuration: set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }
  cached = createClient(url, key);
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
