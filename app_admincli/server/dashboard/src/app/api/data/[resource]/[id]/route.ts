import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { findResource } from "@/lib/resources";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { UUID, buildPatch, guard, pickRow } from "@/lib/api-helpers";
import { runUploadAction } from "@/lib/python-upload";
import type { Resource } from "@/lib/resources";

type Ctx = { params: Promise<{ resource: string; id: string }> };

/** Clear the record's GitHub uploads via the same Python helpers the CLI uses. */
async function purgeUploads(resource: Resource, id: string): Promise<number> {
  if (!resource.fields.some((field) => field.type === "file" || field.type === "files")) return 0;
  try {
    const payload = await runUploadAction({
      action: "purge",
      table: resource.table,
      id,
    });
    return payload.removed ?? 0;
  } catch {
    return 0;
  }
}

export async function GET(_request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;

  const { resource: key, id } = await params;
  const resource = findResource(key);
  if (!resource) return jsonError("Unknown section", 404);
  if (!UUID.test(id)) return jsonError("Bad id", 400);

  const { data, error } = await db().from(resource.table).select("*").eq("id", id).limit(1);
  if (error) return jsonError("Could not load that", 500);
  if (!data || data.length === 0) return jsonError("Not found", 404);

  return NextResponse.json({ data: pickRow(resource, data[0]) });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const { resource: key, id } = await params;
  const resource = findResource(key);
  if (!resource) return jsonError("Unknown section", 404);
  if (!UUID.test(id)) return jsonError("Bad id", 400);

  const body = await readJson(request);
  if (!body) return jsonError("Bad request", 400);

  const patch = buildPatch(resource, body);
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true, changed: 0 });

  const { error } = await db().from(resource.table).update(patch).eq("id", id);
  if (error) return jsonError("Could not save that", 500);

  return NextResponse.json({ ok: true, changed: Object.keys(patch).length });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const { resource: key, id } = await params;
  const resource = findResource(key);
  if (!resource) return jsonError("Unknown section", 404);
  if (!UUID.test(id)) return jsonError("Bad id", 400);

  const purged = await purgeUploads(resource, id);

  const { error } = await db().from(resource.table).delete().eq("id", id);
  if (error) return jsonError("Could not delete that", 500);

  return NextResponse.json({ ok: true, purged });
}
