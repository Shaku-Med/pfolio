import db from "../lib/database/supabase";

type IdRow = { id: string };

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const origin = url.origin;

  const staticPaths = [
    "/",
    "/projects",
    "/experience",
    "/stack",
    "/gallery",
    "/blog",
    "/tags",
    "/search",
    "/resume",
    "/contact",
    "/settings",
  ];

  const [projects, experiences, stacks, galleries, blogs] = await Promise.all([
    db.from("projects").select("id"),
    db.from("experience").select("id"),
    db.from("stack").select("id"),
    db.from("gallery").select("id"),
    db.from("blog_posts").select("id"),
  ]);

  const urls = new Set<string>();

  staticPaths.forEach((path) => urls.add(`${origin}${path}`));

  (projects.data as IdRow[] | null | undefined)?.forEach((row) => {
    urls.add(`${origin}/projects/${row.id}`);
  });

  (experiences.data as IdRow[] | null | undefined)?.forEach((row) => {
    urls.add(`${origin}/experience/${row.id}`);
  });

  (stacks.data as IdRow[] | null | undefined)?.forEach((row) => {
    urls.add(`${origin}/stack/${row.id}`);
  });

  (galleries.data as IdRow[] | null | undefined)?.forEach((row) => {
    urls.add(`${origin}/gallery/${row.id}`);
  });

  (blogs.data as IdRow[] | null | undefined)?.forEach((row) => {
    urls.add(`${origin}/blog/${row.id}`);
  });

  const urlEntries = Array.from(urls)
    .map(
      (loc) => `
  <url>
    <loc>${loc}</loc>
  </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}