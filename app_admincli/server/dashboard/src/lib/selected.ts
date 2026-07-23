/** Tables that can appear in home “selected” teasers. */
export const SELECTED_TABLES = [
  "projects",
  "stack",
  "gallery",
  "blog_posts",
] as const;

export type SelectedTable = (typeof SELECTED_TABLES)[number];

export const SELECTED_TABLE_LABELS: Record<SelectedTable, string> = {
  projects: "Projects (Selected work)",
  stack: "Stack",
  gallery: "Gallery",
  blog_posts: "Blog",
};

export function isSelectedTable(value: unknown): value is SelectedTable {
  return typeof value === "string" && (SELECTED_TABLES as readonly string[]).includes(value);
}

/** Human label for a candidate / selected row. */
export function selectedItemLabel(table: SelectedTable, row: Record<string, unknown>): string {
  if (table === "stack") {
    const category = typeof row.category === "string" ? row.category : "";
    const tools = typeof row.tools === "string" ? row.tools : "";
    return [category, tools].filter(Boolean).join(" — ") || String(row.id ?? "");
  }
  if (typeof row.title === "string" && row.title.trim()) return row.title.trim();
  if (typeof row.slug === "string" && row.slug.trim()) return row.slug.trim();
  return String(row.id ?? "");
}
