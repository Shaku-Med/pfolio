export type FieldType =
  | "text"
  | "url"
  | "textarea"
  | "markdown"
  | "tags"
  | "json"
  | "period"
  | "select"
  | "file"
  | "files";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: string[];
  required?: boolean;
  nullable?: boolean;
};

export type Column = { key: string; label: string };

export type Resource = {
  key: string;
  table: string;
  title: string;
  singular: string;
  blurb: string;
  orderBy: { column: string; ascending: boolean };
  columns: Column[];
  fields: Field[];
};

export const RESOURCES: Resource[] = [
  {
    key: "projects",
    table: "projects",
    title: "Projects",
    singular: "project",
    blurb: "Things you have built and want on the front page.",
    orderBy: { column: "position", ascending: true },
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "tags", label: "Tags" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "tags", label: "Tags", type: "tags", help: "Separate with commas" },
      { name: "image", label: "Cover image", type: "file", help: "Replacing this keeps the same link, so nothing breaks" },
      { name: "image_alt", label: "Image alt text", type: "text", help: "Describes the image for screen readers" },
      { name: "github_url", label: "GitHub URL", type: "url", nullable: true },
      { name: "live_url", label: "Live URL", type: "url", nullable: true },
      { name: "links", label: "Extra links", type: "json", help: 'Array like [{"label":"Demo","url":"https://..."}]' },
      { name: "details_md", label: "Detail page", type: "markdown", nullable: true },
    ],
  },
  {
    key: "experience",
    table: "experience",
    title: "Experience",
    singular: "role",
    blurb: "Where you have worked and what you did there.",
    orderBy: { column: "position", ascending: true },
    columns: [
      { key: "title", label: "Title" },
      { key: "company", label: "Company" },
      { key: "period", label: "Period" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "company", label: "Company", type: "text", nullable: true },
      { name: "role", label: "Role", type: "text" },
      { name: "period", label: "Period", type: "period" },
      { name: "logo", label: "Logo", type: "file", help: "Replacing this keeps the same link" },
      { name: "location", label: "Location", type: "text", nullable: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "highlights", label: "Highlights", type: "tags", help: "Separate with commas" },
      { name: "tags", label: "Tags", type: "tags", help: "Separate with commas" },
      { name: "development_summary", label: "Development summary", type: "textarea", nullable: true },
      { name: "challenges", label: "Challenges", type: "tags", help: "Separate with commas" },
      { name: "learnings", label: "Learnings", type: "tags", help: "Separate with commas" },
      { name: "details_md", label: "Detail page", type: "markdown", nullable: true },
    ],
  },
  {
    key: "stack",
    table: "stack",
    title: "Stack",
    singular: "stack entry",
    blurb: "Tools and tech grouped by category.",
    orderBy: { column: "position", ascending: true },
    columns: [
      { key: "category", label: "Category" },
      { key: "tools", label: "Tools" },
    ],
    fields: [
      { name: "category", label: "Category", type: "text", required: true },
      { name: "tools", label: "Tools", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "gallery",
    table: "gallery",
    title: "Gallery",
    singular: "gallery item",
    blurb: "Image sets that show the work rather than describe it.",
    orderBy: { column: "position", ascending: true },
    columns: [
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle" },
      { key: "tone", label: "Tone" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "tone", label: "Tone", type: "select", options: ["dark", "light"] },
      { name: "src", label: "Primary image", type: "file", help: "Replacing this keeps the same link" },
      {
        name: "project_srcs",
        label: "More images",
        type: "files",
        help: "Add, replace, or remove extra images. Stored paths keep the same link; http(s) URLs get a new endpoint on replace.",
      },
      { name: "details_md", label: "Detail page", type: "markdown", nullable: true },
    ],
  },
  {
    key: "blog",
    table: "blog_posts",
    title: "Blog",
    singular: "post",
    blurb: "Posts, notes and write ups.",
    orderBy: { column: "position", ascending: true },
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "date", label: "Date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, help: "Used in the URL" },
      { name: "category", label: "Category", type: "text" },
      { name: "date", label: "Date", type: "text", placeholder: "YYYY-MM-DD", nullable: true },
      { name: "read_time", label: "Read time", type: "text", placeholder: "5 min", nullable: true },
      { name: "tags", label: "Tags", type: "tags", help: "Separate with commas" },
      { name: "cover_image", label: "Cover image", type: "file", help: "Replacing this keeps the same link" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body", type: "markdown" },
    ],
  },
];

export function findResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}

export type Row = Record<string, unknown>;

export function emptyValue(field: Field): unknown {
  switch (field.type) {
    case "tags":
    case "json":
    case "files":
      return [];
    case "period":
      return { from: "", to: "" };
    case "select":
      return field.options?.[0] ?? "";
    default:
      return "";
  }
}

export function blankRow(resource: Resource): Row {
  const row: Row = {};
  for (const field of resource.fields) row[field.name] = emptyValue(field);
  return row;
}

/** Pulls a stored row into form shape so every input starts filled. */
export function toFormValues(resource: Resource, row: Row): Row {
  const values: Row = {};
  for (const field of resource.fields) {
    const raw = row[field.name];
    if (field.type === "period") {
      const p = (raw ?? {}) as { from?: unknown; to?: unknown };
      values[field.name] = { from: String(p.from ?? ""), to: String(p.to ?? "") };
    } else if (field.type === "tags" || field.type === "json" || field.type === "files") {
      values[field.name] = Array.isArray(raw) ? raw : [];
    } else {
      values[field.name] = raw == null ? "" : String(raw);
    }
  }
  return values;
}

export function normalizeForSave(field: Field, value: unknown): unknown {
  if (field.type === "tags") {
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    return String(value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (field.type === "json" || field.type === "files") return Array.isArray(value) ? value : [];
  if (field.type === "period") {
    const p = (value ?? {}) as { from?: unknown; to?: unknown };
    return { from: String(p.from ?? "").trim(), to: String(p.to ?? "").trim() };
  }
  const text = String(value ?? "").trim();
  if (!text && field.nullable) return null;
  return text;
}

export function isSameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/** Only the fields the admin actually changed, so a save never touches the rest. */
export function changedFields(resource: Resource, initial: Row, current: Row): Row {
  const patch: Row = {};
  for (const field of resource.fields) {
    if (field.type === "file" || field.type === "files") continue;
    const before = normalizeForSave(field, initial[field.name]);
    const after = normalizeForSave(field, current[field.name]);
    if (!isSameValue(before, after)) patch[field.name] = after;
  }
  return patch;
}
