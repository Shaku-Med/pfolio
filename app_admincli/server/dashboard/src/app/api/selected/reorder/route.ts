import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { UUID, guard } from "@/lib/api-helpers";
import { isSelectedTable } from "@/lib/selected";

/** Persist selected order for one table. Body: { table, itemIds: string[] } */
export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const body = await readJson(request);
  const table = body?.table;
  if (!isSelectedTable(table)) return jsonError("Unknown section", 400);

  const itemIds = Array.isArray(body?.itemIds)
    ? body.itemIds.filter((id): id is string => typeof id === "string" && UUID.test(id))
    : [];
  if (itemIds.length === 0) return jsonError("No items to reorder", 400);

  const client = db();
  const updates = itemIds.map((itemId, position) =>
    client
      .from("selected_items")
      .update({ position })
      .eq("table_name", table)
      .eq("item_id", itemId),
  );
  const results = await Promise.all(updates);
  if (results.some((r) => r.error)) return jsonError("Could not save that order", 500);

  return NextResponse.json({ ok: true });
}
