"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { request } from "@/lib/client-api";

export function ResumeEditor() {
  const [initial, setInitial] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    request<{ data: { body_md: string } }>("GET", "/api/resume")
      .then((result) => {
        if (!active) return;
        const body = result.data?.body_md ?? "";
        setInitial(body);
        setValue(body);
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : "Could not load it");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dirty = value !== initial;

  const save = async () => {
    setSaving(true);
    try {
      await request("PUT", "/api/resume", { body_md: value });
      setInitial(value);
      toast.success("Resume saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save it");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
          <p className="text-sm text-muted-foreground">
            The markdown version shown on the site. It loads with what is already saved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValue(initial)}
            disabled={!dirty || saving}
          >
            <RotateCcw />
            Undo changes
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={!dirty || saving || loading}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div className="space-y-3">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write the resume in markdown"
            className="min-h-[28rem] resize-y font-mono text-[13px] leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            {dirty ? "You have unsaved changes" : "Everything is saved"}
          </p>
        </div>
      )}
    </div>
  );
}
