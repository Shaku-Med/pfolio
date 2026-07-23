"use client";

import { ExternalLink, File as FileIcon, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Field } from "@/lib/resources";
import { fileName, fileUrl, isImage } from "@/lib/files";

type Props = {
  field: Field;
  value: unknown;
  changed: boolean;
  onChange: (value: unknown) => void;
  onPickFile?: (file: File, index?: number) => void;
  onRemoveFile?: (index: number) => void;
  uploading?: boolean;
  canUpload?: boolean;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asEndpoints(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export function FieldInput({
  field,
  value,
  changed,
  onChange,
  onPickFile,
  onRemoveFile,
  uploading,
  canUpload,
}: Props) {
  const id = `field-${field.name}`;

  const control = () => {
    switch (field.type) {
      case "file": {
        const current = asText(value).trim();
        return (
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3.5">
            {current ? (
              <div className="flex items-center gap-3">
                {isImage(current) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileUrl(current)}
                    alt={fileName(current)}
                    className="size-14 shrink-0 rounded-md border border-border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <FileIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">{fileName(current)}</p>
                  <a
                    href={fileUrl(current)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Open full size
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {canUpload ? "Pick a jpg, png, or webp — uploads when you save" : "Nothing uploaded yet"}
              </p>
            )}
            {canUpload ? (
              <>
                <input
                  id={id}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (picked) onPickFile?.(picked);
                    e.target.value = "";
                  }}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-secondary-foreground"
                />
                {uploading && (
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                )}
              </>
            ) : null}
          </div>
        );
      }

      case "files": {
        const endpoints = asEndpoints(value);
        return (
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3.5">
            {endpoints.length === 0 ? (
              <p className="text-xs text-muted-foreground">No extra images yet</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {endpoints.map((endpoint, index) => {
                  const external = /^https?:\/\//i.test(endpoint);
                  const preview = isImage(endpoint);
                  return (
                    <li
                      key={`${endpoint}-${index}`}
                      className="overflow-hidden rounded-md border border-border bg-background"
                    >
                      <a
                        href={fileUrl(endpoint)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-muted/40"
                        title="Open full size"
                      >
                        {preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fileUrl(endpoint)}
                            alt={fileName(endpoint)}
                            className="aspect-[4/3] w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex aspect-[4/3] w-full items-center justify-center">
                            <FileIcon className="size-8 text-muted-foreground" />
                          </div>
                        )}
                      </a>
                      <div className="space-y-2 p-3">
                        <p className="truncate text-sm font-medium">{fileName(endpoint)}</p>
                        {canUpload && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <label className="inline-flex h-7 cursor-pointer items-center rounded-md px-2 text-xs text-muted-foreground hover:bg-muted">
                              Replace
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={uploading}
                                className="sr-only"
                                onChange={(e) => {
                                  const picked = e.target.files?.[0];
                                  if (picked) onPickFile?.(picked, index);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive"
                              disabled={uploading}
                              onClick={() => onRemoveFile?.(index)}
                            >
                              <Trash2 className="size-3.5" />
                              Remove
                            </Button>
                            {external && (
                              <span className="text-[10px] text-muted-foreground">external</span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {canUpload ? (
              <>
                <input
                  id={id}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    for (const file of picked) onPickFile?.(file);
                    e.target.value = "";
                  }}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-secondary-foreground"
                />
                {uploading && (
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                )}
              </>
            ) : null}
          </div>
        );
      }

      case "textarea":
        return (
          <Textarea
            id={id}
            value={asText(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-24 resize-y"
          />
        );

      case "markdown":
        return (
          <Textarea
            id={id}
            value={asText(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-44 resize-y font-mono text-[13px] leading-relaxed"
          />
        );

      case "tags":
        return (
          <Input
            id={id}
            value={Array.isArray(value) ? value.join(", ") : asText(value)}
            placeholder={field.placeholder ?? "one, two, three"}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        );

      case "json": {
        const text = Array.isArray(value) ? JSON.stringify(value, null, 2) : asText(value);
        return (
          <Textarea
            id={id}
            defaultValue={text}
            placeholder={field.placeholder ?? "[]"}
            onChange={(e) => {
              try {
                const next = e.target.value.trim() ? JSON.parse(e.target.value) : [];
                onChange(Array.isArray(next) ? next : []);
              } catch {
                // keep the last valid value while the admin is mid typing
              }
            }}
            className="min-h-28 resize-y font-mono text-[13px]"
          />
        );
      }

      case "period": {
        const period = (value ?? {}) as { from?: string; to?: string };
        return (
          <div className="grid grid-cols-2 gap-3">
            <Input
              id={id}
              value={period.from ?? ""}
              placeholder="2024"
              onChange={(e) => onChange({ ...period, from: e.target.value })}
            />
            <Input
              value={period.to ?? ""}
              placeholder="Present"
              onChange={(e) => onChange({ ...period, to: e.target.value })}
            />
          </div>
        );
      }

      case "select":
        return (
          <Select value={asText(value)} onValueChange={(next) => onChange(next)}>
            <SelectTrigger id={id} className="w-full">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={id}
            type={field.type === "url" ? "url" : "text"}
            value={asText(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
        <Label htmlFor={id} className="text-sm font-medium leading-none">
          {field.label}
        </Label>
        {field.required && (
          <span className="text-xs leading-none text-muted-foreground">required</span>
        )}
        {changed && (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
            edited
          </Badge>
        )}
      </div>
      {control()}
    </div>
  );
}
