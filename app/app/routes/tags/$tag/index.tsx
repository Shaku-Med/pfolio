import { Link, useLoaderData } from "react-router";
import type { SearchResult } from "../../../lib/database/queries";
import { searchByTag } from "../../../lib/database/queries";
import { buildPageMeta } from "../../../lib/seo";

const PAGE_SIZE = 20;

export function meta({ data }: { data: { tag: string } | undefined }) {
  const tag = data?.tag ?? "";
  return buildPageMeta({
    title: tag ? `#${tag} – Tags – Mohamed Amara` : "Tags – Mohamed Amara",
    description: "Items across projects, experience, stack, blog, and gallery that mention this tag.",
    canonicalPath: tag ? `/tags/${encodeURIComponent(tag)}` : "/tags",
  });
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: Promise<{ tag: string }>;
}) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;
  const results = await searchByTag(decodedTag, limit + 1, offset);
  const hasMore = results.length > limit;
  const pageResults = hasMore ? results.slice(0, limit) : results;
  return { tag: decodedTag, results: pageResults as SearchResult[], page, hasMore };
}

export default function TagPage() {
  const { tag, results, page, hasMore } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-16 md:px-6 md:py-24 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tag: <span className="text-primary">#{tag}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Items across projects, experience, stack, blog, and gallery that mention this tag.
        </p>
      </header>

      {results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No items found for <span className="font-medium">#{tag}</span>.
        </p>
      )}

      {results.length > 0 && (
        <section className="space-y-4">
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-background/80">
            {results.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="px-4 py-3 sm:px-5">
                <Link
                  to={item.href}
                  className="flex flex-col gap-1 hover:text-primary"
                >
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
                    <span>{item.kind}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  {item.summary && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {page}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  to={`/tags/${encodeURIComponent(tag)}?page=${page - 1}`}
                  className="rounded-md border border-border/60 px-2 py-1 hover:bg-muted"
                >
                  Previous
                </Link>
              )}
              {hasMore && (
                <Link
                  to={`/tags/${encodeURIComponent(tag)}?page=${page + 1}`}
                  className="rounded-md border border-border/60 px-2 py-1 hover:bg-muted"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

