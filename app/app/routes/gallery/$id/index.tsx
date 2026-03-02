import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { getGallery, getGalleryById } from "../../../lib/database/queries";
import type { GalleryItem } from "../../../lib/gallery";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { BASE_URL, buildPageMeta } from "~/lib/seo";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getGalleryById(id);
  if (!item) return null;
  return { item };
}

export function meta({ data }: { data: { item: GalleryItem } | null }) {
  if (!data?.item) {
    return buildPageMeta({
      title: "Not found – Mohamed Amara",
      description: "Gallery item not found.",
      noindex: true,
    });
  }
  const item = data.item;
  const ogImage = item.src
    ? item.src.startsWith("http")
      ? item.src
      : `${BASE_URL}/api/load/image${item.src}`
    : undefined;
  return buildPageMeta({
    title: `${item.title} – Gallery – Mohamed Amara`,
    description: item.subtitle ?? undefined,
    canonicalPath: `/gallery/${item.id}`,
    ogImage,
    ogImageAlt: item.title,
  });
}

export default function GalleryIdIndex() {
  const data = useLoaderData<typeof loader>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [imgColors, setImgColors] = useState<string[]>([]);
  if (!data?.item) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
        <p className="text-lg text-muted-foreground">Gallery item not found.</p>
      </main>
    );
  }

  const item = data.item as GalleryItem;
  const src =
    item.src && item.src.startsWith("http")
      ? item.src
      : `/api/load/image${item.src}`;
  const extras = item.projectSrcs ?? [];

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <article>
        {/* ── Hero ── */}
        <div className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-3xl">
          <div className="aspect-[21/9] w-full bg-background">
            <CanvasGradient colors={imgColors} />
            <ImgLoader
              shouldShowPreview={true}
              src={src}
              alt={item.title}
              loading="lazy"
              className="h-full w-full"
              imageClassName="object-contain"
              getImgColors={true}
              onGetImgColorsCallback={(colors) => {
                setImgColors(colors);
              }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              Gallery
            </span>
          </div>
        </div>

        {/* ── Side-by-side ── */}
        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[1fr_17rem]">
          {/* Left column */}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.65rem]">
              {item.title}
            </h1>

            {item.subtitle && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {item.subtitle}
              </p>
            )}

            {/* ── Carousel ── */}
            {extras.length > 0 && (
              <>
                <hr className="my-8 border-border/50" />

                <div className="relative">
                  <button
                    onClick={() => scroll("left")}
                    className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-opacity hover:bg-background"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="absolute -right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-opacity hover:bg-background"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div
                    ref={scrollRef}
                    className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth"
                  >
                    {extras.map((p, i) => {
                      const extraSrc =
                        p && p.startsWith("http")
                          ? p
                          : `/api/load/image${p}`;
                      return (
                        <div
                          key={`${p}-${i}`}
                          className="w-40 shrink-0 snap-start overflow-hidden rounded-xl bg-muted sm:w-48"
                        >
                          <ImgLoader
                            shouldShowPreview={true}
                            multipleImages={extras.map(p => p && p.startsWith("http") ? p : `/api/load/image${p}`)}
                            multipleCurrentImageIndex={i}
                            src={extraSrc}
                            alt={`${item.title} ${i + 1}`}
                            loading="lazy"
                            className="aspect-[4/3] h-full w-full"
                            imageClassName="object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── Markdown body ── */}
            {item.detailsMd && (
              <>
                <hr className="my-8 border-border/50" />

                <div className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.85] prose-a:text-primary prose-a:underline-offset-4 prose-img:rounded-xl prose-pre:bg-muted prose-pre:border prose-pre:border-border/40 prose-code:text-[0.875em] max-w-none text-[0.938rem]">
                  <MarkdownBody content={item.detailsMd} />
                </div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="lg:pt-1">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  Project
                </h3>
                <p className="text-sm text-foreground">{item.title}</p>
              </div>

              {extras.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Images
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {extras.length + 1} total
                  </p>
                </div>
              )}

              {item.tone && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Tone
                  </h3>
                  <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                    {item.tone}
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}