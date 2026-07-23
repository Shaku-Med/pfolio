"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  File as FileIcon,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FieldInput } from "@/components/field-input";
import { request } from "@/lib/client-api";
import { fileName, fileUrl, isImage } from "@/lib/files";
import {
  blankRow,
  changedFields,
  isSameValue,
  normalizeForSave,
  toFormValues,
  type Resource,
  type Row,
} from "@/lib/resources";

type Props = { resource: Resource };

type DialogState =
  | { mode: "closed" }
  | { mode: "new" }
  | { mode: "edit"; id: string; loading: boolean };

function cellText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ");
  if (typeof value === "object") {
    const p = value as { from?: unknown; to?: unknown };
    if ("from" in p || "to" in p) return [p.from, p.to].filter(Boolean).join(" to ");
    return JSON.stringify(value);
  }
  return String(value);
}

function RowThumb({ value }: { value: unknown }) {
  const endpoint = typeof value === "string" ? value.trim() : "";
  if (!endpoint) {
    return (
      <div className="size-12 shrink-0 rounded-md border border-dashed border-border bg-muted/20" />
    );
  }
  if (!isImage(endpoint)) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted/20">
        <FileIcon className="size-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fileUrl(endpoint)}
      alt={fileName(endpoint)}
      title={fileName(endpoint)}
      className="size-12 shrink-0 rounded-md border border-border object-cover"
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

export function ResourceManager({ resource }: Props) {
  const router = useRouter();
  const previewField = resource.fields.find((field) => field.type === "file");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [initial, setInitial] = useState<Row>({});
  const [values, setValues] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  /** Files picked on "New …" before the row exists — uploaded right after create. */
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [pendingListFiles, setPendingListFiles] = useState<Record<string, File[]>>({});
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    let active = true;
    request<{ data: Row[] }>("GET", `/api/data/${resource.key}`)
      .then((result) => {
        if (active) setRows(result.data ?? []);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Could not load that list");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resource.key, reloadKey]);

  const load = useCallback(async () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const patch = useMemo(() => {
    if (dialog.mode !== "edit") return {};
    return changedFields(resource, initial, values);
  }, [dialog, initial, values, resource]);

  const changedCount = Object.keys(patch).length;
  const isEdit = dialog.mode === "edit";
  const formLoading = dialog.mode === "edit" && dialog.loading;

  const openNew = () => {
    const blank = blankRow(resource);
    setInitial(blank);
    setValues(blank);
    setPendingFiles({});
    setPendingListFiles({});
    setDialog({ mode: "new" });
  };

  const openEditDialog = async (id: string) => {
    setDialog({ mode: "edit", id, loading: true });
    try {
      const result = await request<{ data: Row }>("GET", `/api/data/${resource.key}/${id}`);
      const form = toFormValues(resource, result.data);
      setInitial(form);
      setValues(form);
      setDialog({ mode: "edit", id, loading: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open that");
      setDialog({ mode: "closed" });
    }
  };

  const openDetail = (id: string) => {
    router.push(`/${resource.key}/${id}`);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (dialog.mode === "new") {
        const body: Row = {};
        for (const field of resource.fields) {
          if (field.type === "file" || field.type === "files") continue;
          body[field.name] = normalizeForSave(field, values[field.name]);
        }
        const created = await request<{ id: string }>("POST", `/api/data/${resource.key}`, body);
        toast.success(`Added the ${resource.singular}`);

        const newId = created?.id ? String(created.id) : "";
        if (newId) {
          const pendingEntries = Object.entries(pendingFiles);
          const pendingListEntries = Object.entries(pendingListFiles);
          if (pendingEntries.length || pendingListEntries.length) {
            setUploadingField(pendingEntries[0]?.[0] ?? pendingListEntries[0]?.[0] ?? null);
            try {
              for (const [column, file] of pendingEntries) {
                const form = new FormData();
                form.append("file", file);
                form.append("resource", resource.key);
                form.append("column", column);
                form.append("id", newId);
                const response = await fetch("/api/upload", { method: "POST", body: form });
                const payload = (await response.json().catch(() => null)) as
                  | { endpoint?: string; error?: string }
                  | null;
                if (!response.ok || !payload?.endpoint) {
                  throw new Error(payload?.error ?? `Could not upload ${column}`);
                }
              }
              for (const [column, files] of pendingListEntries) {
                for (const file of files) {
                  const form = new FormData();
                  form.append("file", file);
                  form.append("resource", resource.key);
                  form.append("column", column);
                  form.append("id", newId);
                  const response = await fetch("/api/upload", { method: "POST", body: form });
                  const payload = (await response.json().catch(() => null)) as
                    | { endpoint?: string; error?: string }
                    | null;
                  if (!response.ok || !payload?.endpoint) {
                    throw new Error(payload?.error ?? `Could not upload ${column}`);
                  }
                }
              }
              toast.success("Cover image uploaded");
            } catch (uploadError) {
              toast.error(
                uploadError instanceof Error
                  ? uploadError.message
                  : "Saved, but the image upload failed — open the item to retry",
              );
            } finally {
              setUploadingField(null);
            }
          }
          setPendingFiles({});
          setPendingListFiles({});
          setDialog({ mode: "closed" });
          router.push(`/${resource.key}/${newId}`);
          return;
        }
        setDialog({ mode: "closed" });
        await load();
      } else if (dialog.mode === "edit") {
        if (changedCount === 0) {
          toast.message("Nothing changed yet");
          setSaving(false);
          return;
        }
        await request("PATCH", `/api/data/${resource.key}/${dialog.id}`, patch);
        toast.success(changedCount === 1 ? "Saved one field" : `Saved ${changedCount} fields`);
        setDialog({ mode: "closed" });
        await load();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (columnName: string, file: File, index?: number) => {
    const field = resource.fields.find((f) => f.name === columnName);
    if (!field) return;

    // New row: stash locally and show a blob preview until save.
    if (dialog.mode === "new") {
      if (field.type === "files") {
        setPendingListFiles((prev) => {
          const next = [...(prev[columnName] ?? [])];
          if (index !== undefined && index >= 0 && index < next.length) {
            next[index] = file;
          } else {
            next.push(file);
          }
          return { ...prev, [columnName]: next };
        });
        setValues((prev) => {
          const existing = Array.isArray(prev[columnName])
            ? [...(prev[columnName] as string[])]
            : [];
          const preview = URL.createObjectURL(file);
          if (index !== undefined && index >= 0 && index < existing.length) {
            existing[index] = preview;
          } else {
            existing.push(preview);
          }
          return { ...prev, [columnName]: existing };
        });
        toast.message("Image ready — it uploads when you save");
        return;
      }

      setPendingFiles((prev) => {
        const old = prev[columnName];
        const oldPreview = values[columnName];
        if (typeof oldPreview === "string" && oldPreview.startsWith("blob:")) {
          URL.revokeObjectURL(oldPreview);
        }
        void old;
        return { ...prev, [columnName]: file };
      });
      setValues((prev) => ({ ...prev, [columnName]: URL.createObjectURL(file) }));
      toast.message("Image ready — it uploads when you save");
      return;
    }

    if (dialog.mode !== "edit") return;
    setUploadingField(columnName);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("resource", resource.key);
      form.append("column", columnName);
      form.append("id", dialog.id);
      if (index !== undefined) form.append("index", String(index));

      const response = await fetch("/api/upload", { method: "POST", body: form });
      const payload = (await response.json().catch(() => null)) as
        | { endpoint?: string; endpoints?: string[]; error?: string }
        | null;
      if (!response.ok || !payload?.endpoint) {
        throw new Error(payload?.error ?? "The upload did not go through");
      }

      const nextValue = payload.endpoints ?? payload.endpoint;
      setInitial((prev) => ({ ...prev, [columnName]: nextValue }));
      setValues((prev) => ({ ...prev, [columnName]: nextValue }));
      toast.success(index === undefined && payload.endpoints ? "Image added" : "File updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The upload did not go through");
    } finally {
      setUploadingField(null);
    }
  };

  const removeFile = async (columnName: string, index: number) => {
    if (dialog.mode === "new") {
      setPendingListFiles((prev) => {
        const next = [...(prev[columnName] ?? [])];
        next.splice(index, 1);
        return { ...prev, [columnName]: next };
      });
      setValues((prev) => {
        const existing = Array.isArray(prev[columnName])
          ? [...(prev[columnName] as string[])]
          : [];
        const removed = existing[index];
        if (typeof removed === "string" && removed.startsWith("blob:")) {
          URL.revokeObjectURL(removed);
        }
        existing.splice(index, 1);
        return { ...prev, [columnName]: existing };
      });
      return;
    }
    if (dialog.mode !== "edit") return;
    setUploadingField(columnName);
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: resource.key,
          column: columnName,
          id: dialog.id,
          index,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { endpoints?: string[]; error?: string }
        | null;
      if (!response.ok || !payload?.endpoints) {
        throw new Error(payload?.error ?? "Could not remove that image");
      }
      setInitial((prev) => ({ ...prev, [columnName]: payload.endpoints }));
      setValues((prev) => ({ ...prev, [columnName]: payload.endpoints }));
      toast.success("Image removed");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove that image");
    } finally {
      setUploadingField(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = String(pendingDelete.id);
    setPendingDelete(null);
    try {
      await request("DELETE", `/api/data/${resource.key}/${id}`);
      toast.success("Deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete that");
    }
  };

  const persistOrder = async (nextRows: Row[]) => {
    const previous = rows;
    setRows(nextRows);
    setReordering(true);
    try {
      await request("PUT", `/api/data/${resource.key}/reorder`, {
        ids: nextRows.map((row) => String(row.id)),
      });
    } catch (error) {
      setRows(previous);
      toast.error(error instanceof Error ? error.message : "Could not save that order");
    } finally {
      setReordering(false);
    }
  };

  const moveRow = (fromId: string, toId: string) => {
    if (fromId === toId || reordering) return;
    const fromIndex = rows.findIndex((row) => String(row.id) === fromId);
    const toIndex = rows.findIndex((row) => String(row.id) === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...rows];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    void persistOrder(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{resource.title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus />
            New {resource.singular}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">Nothing here yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 min-w-10 px-2" />
                  {previewField && (
                    <TableHead className="w-[4.75rem] min-w-[4.75rem] px-4">File</TableHead>
                  )}
                  {resource.columns.map((column) => (
                    <TableHead key={column.key} className="min-w-[8rem] px-4">
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-14 min-w-14 px-3 text-right"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const id = String(row.id);
                  return (
                    <TableRow
                      key={id}
                      draggable={!reordering}
                      onDragStart={(event) => {
                        setDragId(id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", id);
                      }}
                      onDragEnd={() => setDragId(null)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const fromId = event.dataTransfer.getData("text/plain") || dragId;
                        if (fromId) moveRow(fromId, id);
                        setDragId(null);
                      }}
                      className={
                        dragId === id
                          ? "cursor-grabbing bg-muted/40 opacity-70"
                          : "cursor-pointer"
                      }
                      onClick={() => openDetail(id)}
                    >
                      <TableCell
                        className="w-10 min-w-10 px-2 py-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="inline-flex size-8 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
                          aria-label="Drag to reorder"
                          disabled={reordering}
                          onMouseDown={(event) => event.stopPropagation()}
                        >
                          <GripVertical className="size-4" />
                        </button>
                      </TableCell>
                      {previewField && (
                        <TableCell className="w-[4.75rem] min-w-[4.75rem] px-4 py-3">
                          <RowThumb value={row[previewField.name]} />
                        </TableCell>
                      )}
                      {resource.columns.map((column) => (
                        <TableCell key={column.key} className="max-w-72 min-w-[8rem] truncate px-4 py-3">
                          {cellText(row[column.key]) || (
                            <span className="text-muted-foreground">not set</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell
                        className="w-14 min-w-14 px-3 py-3 text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" aria-label="Row actions" />
                            }
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-40">
                            <DropdownMenuItem onClick={() => openDetail(id)}>
                              <ExternalLink />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void openEditDialog(id)}>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setPendingDelete(row)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={dialog.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open && !saving) {
            for (const value of Object.values(values)) {
              if (typeof value === "string" && value.startsWith("blob:")) {
                URL.revokeObjectURL(value);
              }
              if (Array.isArray(value)) {
                for (const item of value) {
                  if (typeof item === "string" && item.startsWith("blob:")) {
                    URL.revokeObjectURL(item);
                  }
                }
              }
            }
            setPendingFiles({});
            setPendingListFiles({});
            setDialog({ mode: "closed" });
          }
        }}
      >
        <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>
              {isEdit ? `Edit ${resource.singular}` : `New ${resource.singular}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEdit ? `Edit ${resource.singular}` : `New ${resource.singular}`}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {formLoading ? (
              <div className="space-y-0 px-6 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border-b border-border py-5 last:border-b-0">
                    <Skeleton className="mb-3 h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              resource.fields.map((field) => (
                <div
                  key={field.name}
                  className="border-b border-border px-6 py-5 last:border-b-0"
                >
                  <FieldInput
                    field={field}
                    value={values[field.name]}
                    canUpload={dialog.mode === "new" || dialog.mode === "edit"}
                    uploading={uploadingField === field.name || (saving && !!pendingFiles[field.name])}
                    onPickFile={(file, index) => void uploadFile(field.name, file, index)}
                    onRemoveFile={(index) => void removeFile(field.name, index)}
                    changed={
                      dialog.mode === "new"
                        ? !!(pendingFiles[field.name] || (pendingListFiles[field.name]?.length ?? 0) > 0)
                        : !isSameValue(
                            normalizeForSave(field, initial[field.name]),
                            normalizeForSave(field, values[field.name]),
                          )
                    }
                    onChange={(next) => setValues((prev) => ({ ...prev, [field.name]: next }))}
                  />
                </div>
              ))
            )}
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setDialog({ mode: "closed" })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || formLoading}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? "Save" : `Add ${resource.singular}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {resource.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
