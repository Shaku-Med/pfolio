import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import ExperienceItem from "../../components/accessories/ExperienceItem";
import { LoadMoreSkeleton } from "../../components/accessories/LoadMoreSkeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/ui/empty";
import { useInView } from "../../hooks/useInView";
import { Briefcase } from "lucide-react";
import { getExperience } from "../../lib/database/queries";
import type { ExperienceEntry } from "../../lib/experience";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 12;

export function meta() {
  return buildPageMeta({
    title: "Experience – Mohamed Amara",
    description: "Where I've worked and what I've shipped.",
    canonicalPath: "/experience",
  });
}

export async function loader() {
  const data = await getExperience(PAGE_SIZE, 0);
  return { items: data };
}

export default function ExperienceIndex() {
  const { items: initialItems } = useLoaderData<typeof loader>();
  const [items, setItems] = useState<ExperienceEntry[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const appendedRef = useRef(false);
  const { ref: sentinelRef, inView } = useInView();
  const fetcher = useFetcher<ExperienceEntry[]>();

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
    fetcher.load(
      `/api/data/experience?limit=${PAGE_SIZE}&offset=${items.length}`
    );
  }, [inView, hasMore, items.length, fetcher.state]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 px-5 py-2 sm:py-5 md:py-6">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">
          Experience
        </h1>
        <Empty className="border border-dashed bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase />
            </EmptyMedia>
            <EmptyTitle>No experience yet</EmptyTitle>
            <EmptyDescription>
              Nothing to show here. Experience entries will appear when added.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 px-5 py-2 sm:py-5 md:py-6">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Experience</h1>
        <div className="space-y-6 border-l border-border/40 pl-4 sm:pl-6">
          {items.map((entry) => (
            <ExperienceItem
              key={entry.id}
              entry={entry}
              to={`/experience/${entry.id}`}
            />
          ))}
        </div>
      </div>
      <div ref={sentinelRef} className="min-h-[1px] w-full">
        {fetcher.state === "loading" && <LoadMoreSkeleton />}
      </div>
    </main>
  );
}
