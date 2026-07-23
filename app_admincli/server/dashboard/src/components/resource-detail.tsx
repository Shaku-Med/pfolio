"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldInput } from "@/components/field-input";
import { request } from "@/lib/client-api";
import {
  changedFields,
  isSameValue,
  normalizeForSave,
  toFormValues,
  type Resource,
  type Row,
} from "@/lib/resources";

type Props = {
  resource: Resource;
  id: string;
};

function titleFromValues(resource: Resource, values: Row): string {
  const firstText = resource.fields.find((field) => field.type === "text" || field.type === "url");
  if (firstText) {
    const raw = values[firstText.name];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return resource.singular;
}

export function ResourceDetail({ resource, id }: Props) {
  const router = useRouter();
  const [initial, setInitial] = useState<Row>({});
  const [values, setValues] = useState<Row>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    request<{ data: Row }>("GET", `/api/data/${resource.key}/${id}`)
      .then((result) => {
        if (!active) return;
        const form = toFormValues(resource, result.data);
        setInitial(form);
        setValues(form);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : "Could not load that");
        router.replace(`/${resource.key}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resource, id, router]);

  const patch = useMemo(() => changedFields(resource, initial, values), [resource, initial, values]);
  const changedCount = Object.keys(patch).length;
  const dirty = changedCount > 0;
  const pageTitle = titleFromValues(resource, values);

  const discard = () => {
    setValues(initial);
  };

  const save = async () => {
    if (!dirty) {
      toast.message("Nothing changed yet");
      return;
    }
    setSaving(true);
    try {
      await request("PATCH", `/api/data/${resource.key}/${id}`, patch);
      setInitial(values);
      toast.success(changedCount === 1 ? "Saved one field" : `Saved ${changedCount} fields`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (columnName: string, file: File, index?: number) => {
    setUploadingField(columnName);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("resource", resource.key);
      form.append("column", columnName);
      form.append("id", id);
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The upload did not go through");
    } finally {
      setUploadingField(null);
    }
  };

  const removeFile = async (columnName: string, index: number) => {
    setUploadingField(columnName);
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: resource.key,
          column: columnName,
          id,
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove that image");
    } finally {
      setUploadingField(null);
    }
  };

  const onDelete = async () => {
    setConfirmDelete(false);
    try {
      await request("DELETE", `/api/data/${resource.key}/${id}`);
      toast.success("Deleted");
      router.push(`/${resource.key}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete that");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {pageTitle}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={discard} disabled={!dirty || saving || loading}>
            <RotateCcw />
            Discard
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={!dirty || saving || loading}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label="More actions" />}
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="space-y-0 overflow-hidden rounded-xl border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-border px-5 py-5 last:border-b-0 sm:px-6">
              <Skeleton className="mb-3 h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {resource.fields.map((field) => (
            <div
              key={field.name}
              className="border-b border-border px-5 py-5 last:border-b-0 sm:px-6"
            >
              <FieldInput
                field={field}
                value={values[field.name]}
                canUpload
                uploading={uploadingField === field.name}
                onPickFile={(file, index) => void uploadFile(field.name, file, index)}
                onRemoveFile={(index) => void removeFile(field.name, index)}
                changed={
                  !isSameValue(
                    normalizeForSave(field, initial[field.name]),
                    normalizeForSave(field, values[field.name]),
                  )
                }
                onChange={(next) => setValues((prev) => ({ ...prev, [field.name]: next }))}
              />
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {resource.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
