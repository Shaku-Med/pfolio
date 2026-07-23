"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GripVertical, Loader2, Plus, RefreshCw, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SELECTED_TABLES,
  SELECTED_TABLE_LABELS,
  type SelectedTable,
} from "@/lib/selected";

type SelectedRow = {
  selectedId: string;
  itemId: string;
  position: number;
  label: string;
};

type AvailableRow = {
  itemId: string;
  label: string;
};

type Payload = {
  table: SelectedTable;
  label: string;
  selected: SelectedRow[];
  available: AvailableRow[];
};

export function SelectedManager() {
  const [table, setTable] = useState<SelectedTable>("projects");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async (nextTable: SelectedTable = table) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/selected?table=${encodeURIComponent(nextTable)}`);
      const payload = (await res.json().catch(() => null)) as (Payload & { error?: string }) | null;
      if (!res.ok || !payload) {
        throw new Error(payload?.error ?? "Could not load selected items");
      }
      setData(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load selected items");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    void load(table);
  }, [table, load]);

  const addItem = async (itemId: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/selected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, itemId }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(payload?.error ?? "Could not add that");
      toast.success("Added to selected");
      await load(table);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add that");
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/selected", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, itemId }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(payload?.error ?? "Could not remove that");
      toast.success("Removed from selected");
      await load(table);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove that");
    } finally {
      setBusy(false);
    }
  };

  const persistOrder = async (rows: SelectedRow[]) => {
    setBusy(true);
    try {
      const res = await fetch("/api/selected/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          itemIds: rows.map((r) => r.itemId),
        }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(payload?.error ?? "Could not save that order");
      setData((prev) => (prev ? { ...prev, selected: rows } : prev));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that order");
      await load(table);
    } finally {
      setBusy(false);
    }
  };

  const moveRow = (fromId: string, toId: string) => {
    if (!data || fromId === toId) return;
    const rows = [...data.selected];
    const from = rows.findIndex((r) => r.itemId === fromId);
    const to = rows.findIndex((r) => r.itemId === toId);
    if (from < 0 || to < 0) return;
    const [item] = rows.splice(from, 1);
    rows.splice(to, 0, item!);
    setData({ ...data, selected: rows });
    void persistOrder(rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <Star className="size-5 text-primary" />
            Selected
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose what shows on the home page teasers, then drag to set order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={table}
            onValueChange={(value) => {
              if ((SELECTED_TABLES as readonly string[]).includes(value)) {
                setTable(value as SelectedTable);
              }
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SELECTED_TABLES.map((key) => (
                <SelectItem key={key} value={key}>
                  {SELECTED_TABLE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh"
            disabled={loading || busy}
            onClick={() => void load(table)}
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3 rounded-xl border border-border bg-background/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">On the home page</h2>
              <span className="text-xs text-muted-foreground">
                {data?.selected.length ?? 0} selected · drag to reorder
              </span>
            </div>
            {!data?.selected.length ? (
              <p className="text-sm text-muted-foreground">
                Nothing selected yet. Add items from the list on the right.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.selected.map((row) => (
                  <li
                    key={row.itemId}
                    draggable={!busy}
                    onDragStart={(event) => {
                      setDragId(row.itemId);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", row.itemId);
                    }}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fromId = event.dataTransfer.getData("text/plain") || dragId;
                      if (fromId) moveRow(fromId, row.itemId);
                      setDragId(null);
                    }}
                    className={`flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2 py-2 ${
                      dragId === row.itemId ? "opacity-60" : ""
                    }`}
                  >
                    <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      disabled={busy}
                      aria-label="Remove from selected"
                      onClick={() => void removeItem(row.itemId)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-background/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Available to add</h2>
              <span className="text-xs text-muted-foreground">
                {data?.available.length ?? 0} left
              </span>
            </div>
            {!data?.available.length ? (
              <p className="text-sm text-muted-foreground">
                Every item in this section is already selected.
              </p>
            ) : (
              <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto">
                {data.available.map((row) => (
                  <li
                    key={row.itemId}
                    className="flex items-center gap-2 rounded-lg border border-border px-2 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">{row.label}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={busy}
                      onClick={() => void addItem(row.itemId)}
                    >
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
