import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { guard } from "@/lib/api-helpers";

const MAX_BODY = 200_000;

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const { data, error } = await db().from("resume").select("id, body_md").limit(1);
  if (error) return jsonError("Could not load the resume", 500);

  const row = data?.[0];
  return NextResponse.json({ data: { body_md: (row?.body_md as string) ?? "" } });
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const body = await readJson(request);
  if (!body) return jsonError("Bad request", 400);

  const markdown = typeof body.body_md === "string" ? body.body_md.trim() : "";
  if (!markdown) return jsonError("Write something first", 400);
  if (markdown.length > MAX_BODY) return jsonError("That is too long to save", 400);

  const existing = await db().from("resume").select("id").limit(1);
  if (existing.error) return jsonError("Could not save the resume", 500);

  const result = existing.data?.length
    ? await db().from("resume").update({ body_md: markdown }).eq("id", existing.data[0].id)
    : await db().from("resume").insert({ id: "default", body_md: markdown });

  if (result.error) return jsonError("Could not save the resume", 500);
  return NextResponse.json({ ok: true });
}
