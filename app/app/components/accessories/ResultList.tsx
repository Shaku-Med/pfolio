import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SearchResult } from "~/lib/database/queries";
import { Reveal } from "./Rail/Rail";
import { TextBlock } from "./TextBlock";

const KIND_LABEL: Record<SearchResult["kind"], string> = {
  project: "Project",
  experience: "Experience",
  stack: "Stack",
  blog: "Post",
  gallery: "Gallery",
  resume: "Resume",
};

type ResultListProps = {
  results: SearchResult[];
  page: number;
  hasMore: boolean;
  pageHref: (page: number) => string;
};

export function ResultList({ results, page, hasMore, pageHref }: ResultListProps) {
  return (
    <section>
      <ul className="divide-y divide-border/60 border-y border-border/60">
        {results.map((item, i) => (
          <li key={`${item.kind}-${item.id}`}>
            <Reveal delay={Math.min(i * 0.04, 0.2)}>
              <Link
                to={item.href}
                className="-mx-3 grid gap-x-6 gap-y-1 rounded-lg px-3 py-5 transition-colors hover:bg-muted/50 sm:grid-cols-[7rem_minmax(0,1fr)]"
              >
                <span className="text-xs text-muted-foreground sm:pt-0.5 sm:text-sm">
                  {KIND_LABEL[item.kind] ?? item.kind}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{item.title}</span>
                  {item.summary && (
                    <TextBlock
                      as="span"
                      text={item.summary}
                      className="mt-1 line-clamp-2 block text-sm text-muted-foreground"
                    />
                  )}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>

      {(page > 1 || hasMore) && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              to={pageHref(page - 1)}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">Page {page}</span>
          {hasMore ? (
            <Link
              to={pageHref(page + 1)}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}
