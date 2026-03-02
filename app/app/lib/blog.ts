export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime?: string;
  tags?: string[];
  coverImage?: string;
  body: string;
};

const postBodies: Record<string, string> = {
  "calm-dashboards": `
Dashboards that handle real data—with delays, errors, and empty states—need to feel **calm** even when the system isn't.

## Empty states

A table with no rows shouldn't look broken. Use a dedicated empty state: a short message, an optional illustration, and a clear next action (e.g. "Create your first project"). Avoid a single "No data" line in the middle of the table.

## Loading

Prefer skeletons or inline spinners that match the layout of the content. Full-page loaders are fine for initial load; for refetch or partial updates, keep the existing content visible and show progress in context.

## Errors

Surface errors where they happen. If a chart fails to load, show an error state in that card with a retry action instead of failing the whole page. Always give the user a way to recover.

*Small investments in these states make dashboards feel reliable and intentional.*
  `.trim(),
  "video-without-drama": `
Running high-volume video encoding and delivery taught me a few things about keeping systems boring in production.

## Queues all the way

Every encode job goes through a queue. No direct "run now" from the API. That gives you retries, backpressure, and a single place to observe throughput. We use Redis-backed queues and process workers that pull jobs and report status.

## Observability first

Metrics for queue depth, job duration, and failure rate. Logs with correlation IDs so you can trace a single asset from upload to delivery. Alerts on SLOs (e.g. p99 encode time), not just "something failed."

## Keep the critical path simple

The path from "upload" to "playable" should be as linear as possible. Feature flags and optional steps are fine, but the happy path should have few branches. That makes reasoning about failures and scaling much easier.

**Result:** fewer surprises, faster debugging, and a system that scales without drama.
  `.trim(),
  "ui-details": `
Small details compound. Here are a few patterns that make UIs feel sharp instead of noisy.

## Spacing rhythm

Use a consistent scale (e.g. 4px base) for margins and padding. Align to the grid so related elements line up. White space is part of the design.

## Motion with purpose

Transitions should be short (150–300ms) and ease in/out. Use them for state changes (open/close, hover) rather than decoration. Prefer \`opacity\` and \`transform\` for performance.

## Copy and focus

Button labels should be verbs. Error messages should suggest a fix. Focus rings must be visible for keyboard users—don't remove them without a replacement.

*Intentional details make interfaces feel built, not assembled.*
  `.trim(),
};

export const blogPosts: BlogPost[] = [
  {
    id: "calm-dashboards",
    slug: "calm-dashboards",
    title: "Designing calm, resilient dashboards",
    category: "Product",
    excerpt:
      "Thoughts on empty states, loading, and error handling so dashboards feel steady even when data is noisy or delayed.",
    date: "2024-03-12",
    readTime: "5 min read",
    tags: ["UX", "Design systems", "Loading states"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    body: postBodies["calm-dashboards"],
  },
  {
    id: "video-without-drama",
    slug: "video-without-drama",
    title: "Shipping video features without drama",
    category: "Systems",
    excerpt:
      "What has worked for me when running high‑volume encoding and delivery: queues, observability, and keeping the critical path simple.",
    date: "2024-02-28",
    readTime: "8 min read",
    tags: ["Infrastructure", "Observability", "Video"],
    coverImage:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=80",
    body: postBodies["video-without-drama"],
  },
  {
    id: "ui-details",
    slug: "ui-details",
    title: "Small details that make UIs feel sharp",
    category: "Craft",
    excerpt:
      "A grab‑bag of patterns around spacing, motion, copy, and focus states that make interfaces feel intentional instead of busy.",
    date: "2024-01-15",
    readTime: "4 min read",
    tags: ["UI", "Motion", "Accessibility"],
    coverImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    body: postBodies["ui-details"],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatBlogDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
