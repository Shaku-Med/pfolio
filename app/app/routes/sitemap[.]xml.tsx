import { getSitemapIds } from "../lib/database/queries";
import { BASE_URL } from "../lib/seo";

const STATIC_PATHS = ["/", "/projects", "/experience", "/stack", "/gallery", "/blog", "/resume", "/contact"];

// URLs come from SITE_URL, never the request's Host header, which a client controls.
export async function loader() {
  const ids = await getSitemapIds();
  const paths = [
    ...STATIC_PATHS,
    ...ids.projects.map((id) => `/projects/${id}`),
    ...ids.experience.map((id) => `/experience/${id}`),
    ...ids.stack.map((id) => `/stack/${id}`),
    ...ids.gallery.map((id) => `/gallery/${id}`),
    ...ids.blog_posts.map((id) => `/blog/${id}`),
  ];

  const body = paths
    .map((path) => `  <url>\n    <loc>${BASE_URL}${encodeURI(path)}</loc>\n  </url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
