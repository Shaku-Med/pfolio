import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import BlogCard from "../../components/accessories/BlogCard";
import { LoadMoreSkeleton } from "../../components/accessories/LoadMoreSkeleton";
import { useInView } from "../../hooks/useInView";
import { getBlogPosts } from "../../lib/database/queries";
import type { BlogPost } from "../../lib/blog";
import { buildPageMeta } from "../../lib/seo";

const PAGE_SIZE = 12;

export function meta() {
  return buildPageMeta({
    title: "Blog – Mohamed Amara",
    description: "Notes on design, engineering, and shipping.",
    canonicalPath: "/blog",
  });
}

export async function loader() {
  const data = await getBlogPosts(PAGE_SIZE, 0);
  return { items: data };
}

export default function BlogIndex() {
  const { items: initialItems } = useLoaderData<typeof loader>();
  const [items, setItems] = useState<BlogPost[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const appendedRef = useRef(false);
  const { ref: sentinelRef, inView } = useInView();
  const fetcher = useFetcher<BlogPost[]>();

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
    fetcher.load(`/api/data/blog?limit=${PAGE_SIZE}&offset=${items.length}`);
  }, [inView, hasMore, items.length, fetcher.state]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Blogs
        </h1>
        <p className="mt-3 text-muted-foreground">
          Notes on building, shipping, and what I've learned along the way.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <>
          <section
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Blog posts"
          >
            {items.map((post) => (
              <div key={post.id} className="min-w-0">
                <BlogCard
                  post={post}
                  variant="full"
                  to={`/blog/${post.id}`}
                />
              </div>
            ))}
          </section>

          <div ref={sentinelRef} className="mt-2 min-h-[1px]">
            {fetcher.state === "loading" && <LoadMoreSkeleton />}
          </div>
        </>
      )}
    </main>
  );
}