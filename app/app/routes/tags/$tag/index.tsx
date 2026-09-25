import { data, Link, useLoaderData } from "react-router";
import type { SearchResult } from "../../../lib/database/queries";
import { searchByTag } from "../../../lib/database/queries";
import { cleanText, pageNumber, tooManyRequests } from "../../../lib/security/http.server";
import { PageHeader } from "../../../components/accessories/Rail/Rail";
import { ResultList } from "../../../components/accessories/ResultList";
import { buildPageMeta } from "../../../lib/seo";

const PAGE_SIZE = 20;
const MAX_TAG_LENGTH = 60;

export function meta({ loaderData: data }: { loaderData: { tag: string } | undefined }) {
  const tag = data?.tag ?? "";
  return buildPageMeta({
    title: tag ? `#${tag} | Tags | Mohamed Amara` : "Tags | Mohamed Amara",
    description: "Everything on this site that mentions this tag.",
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
  const limited = tooManyRequests(request, "search", 40);
  if (limited) throw limited;
  const { tag: rawTag } = await params;
  // Params arrive already decoded, so decoding again would throw on a literal "%".
  const tag = cleanText(rawTag, MAX_TAG_LENGTH);
  if (!tag) throw data(null, { status: 404 });

  const page = pageNumber(new URL(request.url));
  const results = await searchByTag(tag, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  const hasMore = results.length > PAGE_SIZE;
  return { tag, results: results.slice(0, PAGE_SIZE) as SearchResult[], page, hasMore };
}

export default function TagPage() {
  const { tag, results, page, hasMore } = useLoaderData<typeof loader>();
  const count = results.length + (page - 1) * PAGE_SIZE;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-5 md:px-6">
      <PageHeader
        title={`#${tag}`}
        description={
          results.length
            ? `${hasMore ? `${count}+` : count} ${count === 1 ? "place" : "places"} where I've used or written about ${tag}.`
            : undefined
        }
      />

      {results.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing is tagged with {tag} yet.{" "}
          <Link to="/search" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
            Try a search instead
          </Link>
          .
        </p>
      ) : (
        <ResultList
          results={results}
          page={page}
          hasMore={hasMore}
          pageHref={(p) => `/tags/${encodeURIComponent(tag)}?page=${p}`}
        />
      )}
    </main>
  );
}
