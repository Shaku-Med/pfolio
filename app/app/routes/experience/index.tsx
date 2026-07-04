import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import Timeline, {
  experienceToTimeline,
  projectsToTimeline,
  sortTimeline,
} from "../../components/accessories/Timeline/Timeline";
import { PageHeader } from "../../components/accessories/Rail/Rail";
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
import { getExperience, getProjects } from "../../lib/database/queries";
import type { ExperienceEntry } from "../../lib/experience";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 12;

export function meta() {
  return buildPageMeta({
    title: "Experience | Mohamed Amara",
    description: "Where I've worked and what I've shipped, on one timeline.",
    canonicalPath: "/experience",
  });
}

export async function loader() {
  const [items, projects] = await Promise.all([
    getExperience(PAGE_SIZE, 0),
    getProjects(50, 0),
  ]);
  return { items, projects: projects.filter((p) => p.date) };
}

export default function ExperienceIndex() {
  const { items: initialItems, projects } = useLoaderData<typeof loader>();
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

  const timelineItems = sortTimeline([
    ...experienceToTimeline(items),
    ...projectsToTimeline(projects),
  ]);

  if (timelineItems.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
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
              Nothing here yet. Check back soon.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <div className="space-y-4">
        <PageHeader title="Experience" />
        <Timeline items={timelineItems} />
      </div>
      <div ref={sentinelRef} className="min-h-[1px] w-full">
        {fetcher.state === "loading" && <LoadMoreSkeleton />}
      </div>
    </main>
  );
}
