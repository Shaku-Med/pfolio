import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { findResource, blankRow } from "@/lib/resources";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { buildPatch, guard, missingRequired, pickRow } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;

  const resource = findResource((await params).resource);
  if (!resource) return jsonError("Unknown section", 404);

  const { data, error } = await db()
    .from(resource.table)
    .select("*")
    .order(resource.orderBy.column, { ascending: resource.orderBy.ascending })
    .order("id", { ascending: true });

  if (error) return jsonError("Could not load that list", 500);
  return NextResponse.json({ data: (data ?? []).map((row) => pickRow(resource, row)) });
}

export async function POST(request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const resource = findResource((await params).resource);
  if (!resource) return jsonError("Unknown section", 404);

  const body = await readJson(request);
  if (!body) return jsonError("Bad request", 400);

  const row = { ...blankRow(resource), ...buildPatch(resource, body) };
  const missing = missingRequired(resource, row);
  if (missing) return jsonError(`${missing} is required`, 400);

  const { data: maxRows } = await db()
    .from(resource.table)
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition =
    typeof maxRows?.[0]?.position === "number" ? maxRows[0].position + 1 : 0;
  row.position = nextPosition;

  const { data, error } = await db().from(resource.table).insert(row).select("id").limit(1);
  if (error || !data || data.length === 0) return jsonError("Could not save that", 500);

  return NextResponse.json({ id: data[0].id }, { status: 201 });
}
