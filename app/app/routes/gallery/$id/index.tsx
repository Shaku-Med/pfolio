import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { getGalleryById } from "../../../lib/database/queries";
import type { GalleryItem } from "../../../lib/gallery";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { BASE_URL, buildPageMeta } from "~/lib/seo";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { Reveal } from "~/components/accessories/Rail/Rail";

function resolveImageSrc(path: string | null | undefined): string {
  if (!path) return "";
  return path.startsWith("http") ? path : `/api/load/image${path}`;
}

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
      title: "Not found | Mohamed Amara",
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
    title: `${item.title} | Gallery | Mohamed Amara`,
    description: item.subtitle ?? undefined,
    canonicalPath: `/gallery/${item.id}`,
    ogImage,
    ogImageAlt: item.title,
  });
}

export default function GalleryIdIndex() {
  const data = useLoaderData<typeof loader>();
  const [imgColors, setImgColors] = useState<string[]>([]);

  if (!data?.item) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
        <p className="text-lg text-muted-foreground">Gallery item not found.</p>
      </main>
    );
  }

  const item = data.item as GalleryItem;
  const heroSrc = resolveImageSrc(item.src);
  const extras = item.projectSrcs ?? [];

  const allImages = useMemo(() => {
    const extraSrcs = extras.map(resolveImageSrc).filter(Boolean);
    return heroSrc ? [heroSrc, ...extraSrcs] : extraSrcs;
  }, [heroSrc, extras]);

  /** Thumbnails below the hero — hero is already shown above. */
  const thumbnails = useMemo(
    () => (allImages.length > 1 ? allImages.slice(1) : []),
    [allImages],
  );

  const GRID_CAP = 4;
  const gridTiles = useMemo(
    () =>
      thumbnails.length > GRID_CAP
        ? thumbnails.slice(0, GRID_CAP)
        : thumbnails,
    [thumbnails],
  );
  const overflowCount =
    thumbnails.length > GRID_CAP ? thumbnails.length - GRID_CAP : 0;

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <article>
        {/* Hero */}
        <div className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-3xl">
          <div className="aspect-[21/9] w-full bg-background">
            <CanvasGradient colors={imgColors} />
            <ImgLoader
              shouldShowPreview={true}
              multipleImages={allImages}
              multipleCurrentImageIndex={0}
              src={heroSrc}
              alt={item.title}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full"
              imageClassName="object-contain"
              getImgColors={true}
              onGetImgColorsCallback={setImgColors}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              Gallery
            </span>
            {allImages.length > 1 && (
              <p className="mt-3 max-w-xl text-sm text-white/75">
                {allImages.length} images — tap to preview
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[1fr_17rem]">
          <div className="min-w-0">
            <Reveal>
              <h1 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.65rem]">
                {item.title}
              </h1>
            </Reveal>

            {item.subtitle && (
              <Reveal delay={0.08}>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  {item.subtitle}
                </p>
              </Reveal>
            )}

            {thumbnails.length > 0 && (
              <>
                <hr className="my-8 border-border/50" />

                <Reveal delay={0.1}>
                  <div>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                        Gallery
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {allImages.length} images — tap to preview
                        {overflowCount > 0
                          ? ` · ${gridTiles.length} shown`
                          : null}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {gridTiles.map((imageSrc, i) => {
                        const previewIndex = i + 1;
                        const isOverflowTile =
                          overflowCount > 0 && i === gridTiles.length - 1;

                        return (
                          <div
                            key={`${imageSrc}-${previewIndex}`}
                            className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/30"
                          >
                            <ImgLoader
                              shouldShowPreview={true}
                              multipleImages={allImages}
                              multipleCurrentImageIndex={previewIndex}
                              src={imageSrc}
                              alt={`${item.title} ${previewIndex + 1}`}
                              loading="lazy"
                              className="aspect-square w-full"
                              imageClassName="object-cover"
                            />
                            {isOverflowTile ? (
                              <div
                                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[2px]"
                                aria-hidden
                              >
                                <span className="text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
                                  +{overflowCount}
                                </span>
                                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                                  more
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              </>
            )}

            {item.detailsMd && (
              <>
                <hr className="my-8 border-border/50" />

                <div className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.85] prose-a:text-primary prose-a:underline-offset-4 prose-img:rounded-xl prose-pre:bg-muted prose-pre:border prose-pre:border-border/40 prose-code:text-[0.875em] max-w-none text-[0.938rem]">
                  <MarkdownBody content={item.detailsMd} />
                </div>
              </>
            )}
          </div>

          <aside className="lg:pt-1">
            <div className="space-y-8 lg:sticky lg:top-28">
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  Project
                </h3>
                <p className="text-sm text-foreground">{item.title}</p>
              </div>

              {allImages.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Images
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {allImages.length} total
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
