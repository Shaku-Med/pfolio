const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "svg"];

/** The portfolio app proxies uploads through /api/load/image on port 3000. */
export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/** Public brand asset on the portfolio site (logo, favicons, etc.). */
export function siteAssetUrl(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${siteBaseUrl()}/${clean}`;
}

export function isStoredEndpoint(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function fileName(endpoint: string): string {
  const parts = endpoint.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? endpoint;
}

export function isImage(endpoint: string): boolean {
  const trimmed = endpoint.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const ext = fileName(trimmed.split("?")[0] ?? trimmed)
      .split(".")
      .pop()
      ?.toLowerCase();
    // External URLs may omit an extension; still treat them as viewable images.
    if (!ext || ext === trimmed.toLowerCase() || ext.includes("/")) return true;
    return IMAGE_EXTS.includes(ext);
  }
  const ext = fileName(trimmed).split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTS.includes(ext);
}

export function fileUrl(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.replace(/^\/+/, "");
  return `${siteBaseUrl()}/api/load/image/${path}`;
}
