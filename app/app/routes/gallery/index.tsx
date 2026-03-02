import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import GalleryCard from "../../components/accessories/GalleryCard";
import { LoadMoreSkeleton } from "../../components/accessories/LoadMoreSkeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/ui/empty";
import { useInView } from "../../hooks/useInView";
import { ImageIcon } from "lucide-react";
import { getGallery } from "../../lib/database/queries";
import type { GalleryItem } from "../../lib/gallery";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 12;

export function meta() {
  return buildPageMeta({
    title: "Gallery – Mohamed Amara",
    description: "Screenshots and visuals from projects.",
    canonicalPath: "/gallery",
  });
}

export async function loader() {
  const data = await getGallery(PAGE_SIZE, 0);
  return { items: data };
}

export default function GalleryIndex() {
  const { items: initialItems } = useLoaderData<typeof loader>();
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const appendedRef = useRef(false);
  const { ref: sentinelRef, inView } = useInView();
  const fetcher = useFetcher<GalleryItem[]>();

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
      `/api/data/gallery?limit=${PAGE_SIZE}&offset=${items.length}`
    );
  }, [inView, hasMore, items.length, fetcher.state]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-2 sm:py-5 md:py-6">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Gallery</h1>
        <Empty className="border border-dashed bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>No gallery items yet</EmptyTitle>
            <EmptyDescription>
              Nothing to show here. Snapshots will appear when added.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-2 sm:py-5 md:py-6">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Gallery
        </h1>
        <p className="mt-3 text-muted-foreground">
          Snapshots from work and life.
        </p>
      </header>
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="min-w-0">
              <GalleryCard item={item} to={`/gallery/${item.id}`} />
            </div>
          ))}
        </section>
      <div ref={sentinelRef} className="min-h-[1px] w-full">
        {fetcher.state === "loading" && <LoadMoreSkeleton />}
      </div>
    </main>
  );
}
