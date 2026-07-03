import { clientIp, rateLimit } from "~/lib/security/http.server";

const MAX_BYTES = 10 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

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

    const githubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    const res = await fetch(githubUrl);
    if (!res.ok) {
      return new Response(null, { status: res.status === 404 ? 404 : 502 });
    }

    const declaredLength = Number(res.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
      return new Response(null, { status: 413 });
    }
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_BYTES) {
      return new Response(null, { status: 413 });
    }

    const ext = path.split(".").pop()!.toLowerCase();
    const headers = new Headers({
      "Content-Type": CONTENT_TYPES[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    // SVGs render as documents if opened directly; a strict CSP keeps any
    // embedded script from running.
    if (ext === "svg") {
      headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
    }
    return new Response(body, { status: 200, headers });
  } catch (error) {
    console.error("Error loading image from GitHub:", error);
    return new Response(null, { status: 500 });
  }
};
