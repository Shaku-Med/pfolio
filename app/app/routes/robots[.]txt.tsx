import { BASE_URL } from "../lib/seo";

// Internal endpoints stay out of search results; everything else is public.
export function loader() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Allow: /api/load/image/",
    "Disallow: /api/",
    "Disallow: /healthz",
    "Disallow: /search",
    "",
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
