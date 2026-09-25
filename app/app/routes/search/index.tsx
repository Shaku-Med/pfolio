import { Form, useLoaderData } from "react-router";
import { SearchIcon } from "lucide-react";
import type { SearchResult } from "../../lib/database/queries";
import { searchAll } from "../../lib/database/queries";
import { cleanText, pageNumber, tooManyRequests } from "../../lib/security/http.server";
import { PageHeader } from "../../components/accessories/Rail/Rail";
import { ResultList } from "../../components/accessories/ResultList";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 120;

export function meta({ loaderData: data }: { loaderData: { q: string } | undefined }) {
  const title = data?.q ? `"${data.q}" | Search | Mohamed Amara` : "Search | Mohamed Amara";
  return buildPageMeta({
    title,
    description: "Search across projects, experience, stack, blog, and gallery.",
    canonicalPath: "/search",
    noindex: Boolean(data?.q),
  });
}

export async function loader({ request }: { request: Request }) {
  const limited = tooManyRequests(request, "search", 40);
  if (limited) throw limited;
  const url = new URL(request.url);
  const q = cleanText(url.searchParams.get("q"), MAX_QUERY_LENGTH);
  const page = pageNumber(url);

  if (!q) {
    return { q, results: [] as SearchResult[], page, hasMore: false };
  }

  const results = await searchAll(q, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  const hasMore = results.length > PAGE_SIZE;
  return { q, results: results.slice(0, PAGE_SIZE), page, hasMore };
}

export default function SearchPage() {
  const { q, results, page, hasMore } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-5 md:px-6">
      <PageHeader
        title="Search"
        description="Look through everything here: projects, roles, posts, the stack, and the gallery."
      />

      <Form method="get" role="search" className="max-w-2xl">
        <div className="flex items-center gap-2 border-b border-border pb-2 transition-colors focus-within:border-foreground">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Search for a project, tool, or topic"
            className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Search
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tip: wrap words in quotes for an exact match, or try kind:project and
          tag:typescript to narrow things down.
        </p>
      </Form>

      <div className="mt-12">
        {q && results.length === 0 && (
          <p className="text-muted-foreground">
            Nothing matched <span className="text-foreground">"{q}"</span>. Try a shorter
            or broader word.
          </p>
        )}
        {results.length > 0 && (
          <ResultList
            results={results}
            page={page}
            hasMore={hasMore}
            pageHref={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`}
          />
        )}
      </div>
    </main>
  );
}
