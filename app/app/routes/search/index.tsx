import { Form, Link, useLoaderData } from "react-router";
import type { SearchResult } from "../../lib/database/queries";
import { searchAll } from "../../lib/database/queries";
import { RailGlyph, Reveal } from "../../components/accessories/Rail/Rail";
import { TextBlock } from "../../components/accessories/TextBlock";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 20;

export function meta({ data }: { data: { q: string } | undefined }) {
  const title = data?.q
    ? `"${data.q}" | Search | Mohamed Amara`
    : "Search | Mohamed Amara";
  return buildPageMeta({
    title,
    description: "Search across projects, experience, stack, blog, and gallery.",
    canonicalPath: "/search",
  });
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = Number(url.searchParams.get("page") || "1");
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;

  if (!q) {
    return { q, results: [] as SearchResult[], page, hasMore: false };
  }

  const results = await searchAll(q, limit + 1, offset);
  const hasMore = results.length > limit;
  const pageResults = hasMore ? results.slice(0, limit) : results;

  return { q, results: pageResults, page, hasMore };
}

export default function SearchPage() {
  const { q, results, page, hasMore } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6 space-y-8">
      <Reveal>
        <header className="space-y-3">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            <RailGlyph className="h-3 w-8" />
            Search
          </h1>
          <Form method="get" className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder='Try: react OR next · "design system" · kind:project · tag:typescript · -blog'
              className="h-10 flex-1 rounded-full border border-border/70 bg-background px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Search
            </button>
          </Form>
        </header>
      </Reveal>

      {q && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No results for <span className="font-medium">&quot;{q}&quot;</span>.
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
                    <TextBlock
                      text={item.summary}
                      className="line-clamp-2 text-xs text-muted-foreground"
                    />
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
                  to={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
                  className="rounded-md border border-border/60 px-2 py-1 hover:bg-muted"
                >
                  Previous
                </Link>
              )}
              {hasMore && (
                <Link
                  to={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
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

