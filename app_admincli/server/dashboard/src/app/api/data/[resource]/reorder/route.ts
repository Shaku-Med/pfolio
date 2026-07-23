import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { findResource } from "@/lib/resources";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { UUID, guard } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ resource: string }> };

/** Persist a full list order: body `{ ids: string[] }` → position = index. */
export async function PUT(request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const resource = findResource((await params).resource);
  if (!resource) return jsonError("Unknown section", 404);

  const body = await readJson(request);
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id): id is string => typeof id === "string" && UUID.test(id))
    : [];
  if (ids.length === 0) return jsonError("No items to reorder", 400);

  const client = db();
  const updates = ids.map((id, position) =>
    client.from(resource.table).update({ position }).eq("id", id),
  );
  const results = await Promise.all(updates);
  if (results.some((r) => r.error)) return jsonError("Could not save that order", 500);

  return NextResponse.json({ ok: true });
}
