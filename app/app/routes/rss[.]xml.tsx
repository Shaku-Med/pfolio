import { getBlogPosts } from "../lib/database/queries";
import { BASE_URL, SITE_NAME } from "../lib/seo";

const FEED_SIZE = 50;

function xml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: string): string | null {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString();
}

export async function loader() {
  const posts = await getBlogPosts(FEED_SIZE, 0);
  const newest = posts
    .map((post) => new Date(post.date).getTime())
    .filter((time) => !Number.isNaN(time))
    .sort((a, b) => b - a)[0];

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.id}`;
      const pubDate = rfc822(post.date);
      return [
        "    <item>",
        `      <title>${xml(post.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : "",
        post.excerpt ? `      <description>${xml(post.excerpt)}</description>` : "",
        post.category ? `      <category>${xml(post.category)}</category>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(`${SITE_NAME}'s blog`)}</title>
    <link>${xml(`${BASE_URL}/blog`)}</link>
    <description>Notes on what I'm building, what broke along the way, and what I learned fixing it.</description>
    <language>en</language>
    <atom:link href="${xml(`${BASE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
${newest ? `    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
