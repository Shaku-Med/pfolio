import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { UUID, guard } from "@/lib/api-helpers";
import {
  SELECTED_TABLE_LABELS,
  isSelectedTable,
  selectedItemLabel,
  type SelectedTable,
} from "@/lib/selected";

const TITLE_COLUMNS: Record<SelectedTable, string> = {
  projects: "title,category,image",
  stack: "category,tools",
  gallery: "title,subtitle,src",
  blog_posts: "title,slug,category,cover_image",
};

async function nextPosition(tableName: SelectedTable): Promise<number> {
  const { data } = await db()
    .from("selected_items")
    .select("position")
    .eq("table_name", tableName)
    .order("position", { ascending: false })
    .limit(1);
  const top = data?.[0]?.position;
  return typeof top === "number" ? top + 1 : 0;
}

/** List selected + available candidates for one table. */
export async function GET(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const tableRaw = new URL(request.url).searchParams.get("table");
  if (!isSelectedTable(tableRaw)) {
    return jsonError("Pick projects, stack, gallery, or blog_posts", 400);
  }
  const table = tableRaw;

  const client = db();
  const { data: selectedRows, error: selErr } = await client
    .from("selected_items")
    .select("id, item_id, position, created_at")
    .eq("table_name", table)
    .order("position", { ascending: true })
    .order("id", { ascending: true });
  if (selErr) return jsonError("Could not load selected items", 500);

  const { data: allRows, error: allErr } = await client
    .from(table)
    .select(`id,${TITLE_COLUMNS[table]}`)
    .order("position", { ascending: true })
    .order("id", { ascending: true });
  if (allErr) return jsonError("Could not load candidates", 500);

  const byId = new Map(
    (allRows ?? []).map((row) => [String(row.id), row as Record<string, unknown>]),
  );
  const selectedIds = new Set((selectedRows ?? []).map((r) => String(r.item_id)));

  const selected = (selectedRows ?? [])
    .map((row) => {
      const item = byId.get(String(row.item_id));
      if (!item) return null;
      return {
        selectedId: String(row.id),
        itemId: String(row.item_id),
        position: row.position ?? 0,
        label: selectedItemLabel(table, item),
        item,
      };
    })
    .filter(Boolean);

  const available = (allRows ?? [])
    .filter((row) => !selectedIds.has(String(row.id)))
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        itemId: String(row.id),
        label: selectedItemLabel(table, item),
        item,
      };
    });

  return NextResponse.json({
    table,
    label: SELECTED_TABLE_LABELS[table],
    selected,
    available,
  });
}

/** Add an item to the selected set. Body: { table, itemId } */
export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const body = await readJson(request);
  const table = body?.table;
  const itemId = typeof body?.itemId === "string" ? body.itemId.trim() : "";
  if (!isSelectedTable(table)) return jsonError("Unknown section", 400);
  if (!UUID.test(itemId)) return jsonError("Bad item id", 400);

  const client = db();
  const { data: exists } = await client.from(table).select("id").eq("id", itemId).maybeSingle();
  if (!exists) return jsonError("That item does not exist", 404);

  const { data: already } = await client
    .from("selected_items")
    .select("id")
    .eq("table_name", table)
    .eq("item_id", itemId)
    .maybeSingle();
  if (already) return jsonError("Already selected", 409);

  const position = await nextPosition(table);
  const { data, error } = await client
    .from("selected_items")
    .insert({ table_name: table, item_id: itemId, position })
    .select("id")
    .limit(1);
  if (error || !data?.[0]) return jsonError("Could not add that", 500);

  return NextResponse.json({ id: data[0].id, position }, { status: 201 });
}

/** Remove from selected. Body: { table, itemId } */
export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const body = await readJson(request);
  const table = body?.table;
  const itemId = typeof body?.itemId === "string" ? body.itemId.trim() : "";
  if (!isSelectedTable(table)) return jsonError("Unknown section", 400);
  if (!UUID.test(itemId)) return jsonError("Bad item id", 400);

  const { error } = await db()
    .from("selected_items")
    .delete()
    .eq("table_name", table)
    .eq("item_id", itemId);
  if (error) return jsonError("Could not remove that", 500);

  return NextResponse.json({ ok: true });
}
