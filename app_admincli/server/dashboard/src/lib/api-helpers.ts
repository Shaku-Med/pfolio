import "server-only";
import { isSignedIn } from "./session";
import { jsonError } from "./http";
import { normalizeForSave, type Resource, type Row } from "./resources";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function guard(): Promise<Response | null> {
  return (await isSignedIn()) ? null : jsonError("Not signed in", 401);
}

/** Never hand back columns the dashboard did not ask for. */
export function pickRow(resource: Resource, row: Row): Row {
  const out: Row = { id: row.id, position: row.position ?? 0 };
  for (const field of resource.fields) out[field.name] = row[field.name] ?? null;
  return out;
}

/** Accepts only declared fields, so unknown keys can never reach the table. */
export function buildPatch(resource: Resource, body: Record<string, unknown>): Row {
  const patch: Row = {};
  for (const field of resource.fields) {
    // File columns hold GitHub endpoints and are only ever set by the upload service.
    if (field.type === "file" || field.type === "files") continue;
    if (!(field.name in body)) continue;
    patch[field.name] = normalizeForSave(field, body[field.name]);
  }
  return patch;
}

export function missingRequired(resource: Resource, row: Row): string | null {
  for (const field of resource.fields) {
    if (!field.required) continue;
    const value = row[field.name];
    if (typeof value !== "string" || !value.trim()) return field.label;
  }
  return null;
}
