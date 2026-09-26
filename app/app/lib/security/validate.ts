import type { ProjectLink } from "../projects";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

// No separators or quotes, so one field can never expand into several
// Reply-To addresses.
const EMAIL_CHAR = String.raw`[^\s@,;:<>"'()[\]\\]`;
const EMAIL_RE = new RegExp(`^${EMAIL_CHAR}{1,64}@${EMAIL_CHAR}+\\.${EMAIL_CHAR}{2,}$`);

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

/** Returns the URL only when it is plain http(s); anything else is dropped. */
export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const LINK_ICONS = new Set(["doc", "video", "external", "article"]);

export function parseProjectLinks(raw: unknown): ProjectLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const links = raw.flatMap((item): ProjectLink[] => {
    if (!item || typeof item !== "object") return [];
    const { url, label, icon } = item as Record<string, unknown>;
    const href = safeHttpUrl(url);
    if (!href || typeof label !== "string" || !label.trim()) return [];
    return [
      {
        url: href,
        label: label.trim().slice(0, 60),
        ...(typeof icon === "string" && LINK_ICONS.has(icon) && { icon: icon as ProjectLink["icon"] }),
      },
    ];
  });
  return links.length ? links : undefined;
}

// Repo paths for the image proxy, like /07_23_2026/<uuid>/<file>.mp4.
const MEDIA_PATH_RE = /^\/?(?:[A-Za-z0-9][A-Za-z0-9._ -]*\/)*[A-Za-z0-9][A-Za-z0-9._ -]*\.(mp4|webm)$/i;

/**
 * A demo video is either a path in the image repo (served through our proxy)
 * or a direct https link to an .mp4 or .webm file.
 */
export function safeVideoSource(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 512) return undefined;
  if (/^https:\/\//i.test(trimmed)) {
    const href = safeHttpUrl(trimmed);
    return href && /\.(mp4|webm)$/i.test(new URL(href).pathname) ? href : undefined;
  }
  if (trimmed.includes("..") || !MEDIA_PATH_RE.test(trimmed)) return undefined;
  return `/api/load/image/${trimmed.replace(/^\/+/, "")}`;
}
