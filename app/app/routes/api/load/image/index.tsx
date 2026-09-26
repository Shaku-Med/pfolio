import { clientIp, rateLimit } from "~/lib/security/http.server";
import { parseRange } from "~/lib/range";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
};
const VIDEO_EXTS = new Set(["mp4", "webm"]);

const SEGMENT_RE = /^[A-Za-z0-9][A-Za-z0-9._ -]*$/;

/** Decodes and validates the repo path; null means reject. */
function safeRepoPath(raw: string): string | null {
  let path = raw;
  try {
    if (path.includes("%")) path = decodeURIComponent(path);
  } catch {
    return null;
  }
  if (path.length === 0 || path.length > 512) return null;
  if (path.includes("\\") || path.includes("%")) return null;
  const segments = path.split("/").filter((s) => s !== "");
  if (segments.length === 0) return null;
  if (!segments.every((s) => s !== "." && s !== ".." && SEGMENT_RE.test(s))) {
    return null;
  }
  const ext = segments[segments.length - 1].split(".").pop()?.toLowerCase();
  if (!ext || !(ext in CONTENT_TYPES)) return null;
  return segments.join("/");
}

// Browsers fetch video in many small ranges. Keeping the last few clips in
// memory stops each range from pulling the whole file from GitHub again.
const VIDEO_CACHE_TTL_MS = 10 * 60 * 1000;
const VIDEO_CACHE_MAX = 4;
const videoCache = new Map<string, { body: ArrayBuffer; expires: number }>();

function cachedVideo(path: string): ArrayBuffer | null {
  const hit = videoCache.get(path);
  if (!hit || hit.expires <= Date.now()) {
    videoCache.delete(path);
    return null;
  }
  return hit.body;
}

function rememberVideo(path: string, body: ArrayBuffer): void {
  if (videoCache.size >= VIDEO_CACHE_MAX) {
    videoCache.delete(videoCache.keys().next().value as string);
  }
  videoCache.set(path, { body, expires: Date.now() + VIDEO_CACHE_TTL_MS });
}

export const loader = async ({ request }: { request: Request }) => {
  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    if (!owner || !repo) {
      console.error("Image proxy: GITHUB_OWNER/GITHUB_REPO not set");
      return new Response(null, { status: 500 });
    }

    if (!rateLimit(`image:${clientIp(request)}`, 300, 60 * 1000)) {
      return new Response(null, { status: 429 });
    }

    const url = new URL(request.url);
    const raw = url.pathname.split("/api/load/image/")[1] || "";
    const path = safeRepoPath(raw);
    if (!path) {
      return new Response(null, { status: 400 });
    }

    const ext = path.split(".").pop()!.toLowerCase();
    const isVideo = VIDEO_EXTS.has(ext);
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

    let body = isVideo ? cachedVideo(path) : null;
    if (!body) {
      const githubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
      const res = await fetch(githubUrl);
      if (!res.ok) {
        return new Response(null, { status: res.status === 404 ? 404 : 502 });
      }

      const declaredLength = Number(res.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        return new Response(null, { status: 413 });
      }
      body = await res.arrayBuffer();
      if (body.byteLength > maxBytes) {
        return new Response(null, { status: 413 });
      }
      if (isVideo) rememberVideo(path, body);
    }

    const headers = new Headers({
      "Content-Type": CONTENT_TYPES[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });
    // SVGs render as documents if opened directly; a strict CSP keeps any
    // embedded script from running.
    if (ext === "svg") {
      headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
    }

    const range = parseRange(request.headers.get("range"), body.byteLength);
    if (range === "invalid") {
      headers.set("Content-Range", `bytes */${body.byteLength}`);
      return new Response(null, { status: 416, headers });
    }
    if (range) {
      headers.set("Content-Range", `bytes ${range.start}-${range.end}/${body.byteLength}`);
      headers.set("Content-Length", String(range.end - range.start + 1));
      return new Response(body.slice(range.start, range.end + 1), { status: 206, headers });
    }
    return new Response(body, { status: 200, headers });
  } catch (error) {
    console.error("Error loading image from GitHub:", error);
    return new Response(null, { status: 500 });
  }
};
