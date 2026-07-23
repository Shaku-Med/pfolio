import "server-only";

function required(name: string, minLength = 1): string {
  const value = process.env[name];
  if (!value || value.trim().length < minLength) {
    throw new Error(
      `${name} is missing or too short. Set it in app_admincli/dashboard/.env.local before starting the dashboard.`,
    );
  }
  return value.trim();
}

export function supabaseUrl(): string {
  return required("SUPABASE_URL");
}

export function supabaseKey(): string {
  return required("SUPABASE_KEY");
}

export function sessionSecret(): string {
  return required("DASHBOARD_SESSION_SECRET", 32);
}
