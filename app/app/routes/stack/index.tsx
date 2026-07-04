import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import StackCard from "../../components/accessories/StackCard";
import { PageHeader, Reveal } from "../../components/accessories/Rail/Rail";
import { LoadMoreSkeleton } from "../../components/accessories/LoadMoreSkeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/ui/empty";
import { useInView } from "../../hooks/useInView";
import { Layers } from "lucide-react";
import { getStack } from "../../lib/database/queries";
import type { StackCategory } from "../../lib/stack";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 12;

export function meta() {
  return buildPageMeta({
    title: "Stack | Mohamed Amara",
    description: "Tools and tech I use day to day.",
    canonicalPath: "/stack",
  });
}

export async function loader() {
  const data = await getStack(PAGE_SIZE, 0);
  return { items: data };
}

export default function StackIndex() {
  const { items: initialItems } = useLoaderData<typeof loader>();
  const [items, setItems] = useState<StackCategory[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const appendedRef = useRef(false);
  const { ref: sentinelRef, inView } = useInView();
  const fetcher = useFetcher<StackCategory[]>();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (appendedRef.current) return;
    const next = fetcher.data;
    setItems((prev) => [...prev, ...next]);
    setHasMore(next.length === PAGE_SIZE);
    appendedRef.current = true;
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (!inView || !hasMore || fetcher.state !== "idle") return;
    appendedRef.current = false;
    fetcher.load(`/api/data/stack?limit=${PAGE_SIZE}&offset=${items.length}`);
  }, [inView, hasMore, items.length, fetcher.state]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">
          Stack & tooling
        </h1>
        <Empty className="border border-dashed bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>No stack yet</EmptyTitle>
            <EmptyDescription>
              Nothing here yet. Check back soon.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <PageHeader title="Stack & tooling" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <Reveal
            key={item.id}
            delay={Math.min((i % 3) * 0.07, 0.28)}
            className="min-w-0"
          >
            <StackCard item={item} to={`/stack/${item.id}`} />
          </Reveal>
        ))}
      </div>
      <div ref={sentinelRef} className="min-h-[1px] w-full">
        {fetcher.state === "loading" && <LoadMoreSkeleton />}
      </div>
    </main>
  );
}
