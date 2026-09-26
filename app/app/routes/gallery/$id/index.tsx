import { useState } from "react";
import { data, useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { getGalleryById } from "../../../lib/database/queries";
import type { GalleryItem } from "../../../lib/gallery";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { BASE_URL, buildPageMeta } from "~/lib/seo";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import {
  DetailBody,
  DetailCover,
  DetailHeader,
  DetailNotFound,
  DetailShell,
  PROSE_CLASS,
  SideSection,
} from "~/components/accessories/Detail/Detail";

const MORE_LINK = { to: "/gallery", label: "See the gallery" };

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
  if (!item) return data(null, { status: 404 });
  return { item };
}

export function meta({ loaderData: data }: { loaderData: { item: GalleryItem } | null }) {
  if (!data?.item) {
    return buildPageMeta({
      title: "Not found | Mohamed Amara",
      description: "Gallery item not found.",
      noindex: true,
    });
  }
  const item = data.item;
  const ogImage = `/og/gallery/${item.id}`;
  return buildPageMeta({
    title: `${item.title} | Gallery | Mohamed Amara`,
    description: item.subtitle ?? undefined,
    canonicalPath: `/gallery/${item.id}`,
    ogImage,
    ogImageAlt: item.title,
  });
}

const GRID_CAP = 6;

export default function GalleryIdIndex() {
  const data = useLoaderData<typeof loader>();
  const [imgColors, setImgColors] = useState<string[]>([]);

  if (!data?.item) {
    return <DetailNotFound what="gallery item" more={MORE_LINK} />;
  }

  const item = data.item as GalleryItem;
  const heroSrc = resolveImageSrc(item.src);
  const extras = (item.projectSrcs ?? []).map(resolveImageSrc).filter(Boolean);
  const allImages = heroSrc ? [heroSrc, ...extras] : extras;
  const thumbnails = allImages.slice(1);
  const gridTiles = thumbnails.slice(0, GRID_CAP);
  const overflowCount = thumbnails.length - gridTiles.length;

  return (
    <DetailShell>
      <DetailHeader
        eyebrow={allImages.length > 1 ? `${allImages.length} photos` : "Gallery"}
        title={item.title}
        lede={item.subtitle}
      />

      <DetailCover className="bg-background">
        <CanvasGradient colors={imgColors} />
        <ImgLoader
          shouldShowPreview
          multipleImages={allImages}
          multipleCurrentImageIndex={0}
          src={heroSrc}
          alt={item.title}
          loading="eager"
          fetchPriority="high"
          className="h-full w-full"
          imageClassName="object-contain"
          getImgColors
          onGetImgColorsCallback={setImgColors}
        />
      </DetailCover>

      <DetailBody
        aside={
          gridTiles.length > 0 ? (
            <SideSection title={`${thumbnails.length} more ${thumbnails.length === 1 ? "photo" : "photos"}`}>
              <div className="grid grid-cols-3 gap-2">
                {gridTiles.map((imageSrc, i) => {
                  const previewIndex = i + 1;
                  const isLast = overflowCount > 0 && i === gridTiles.length - 1;
                  return (
                    <div
                      key={`${imageSrc}-${previewIndex}`}
                      className="relative overflow-hidden rounded-lg border border-border/60 bg-muted"
                    >
                      <ImgLoader
                        shouldShowPreview
                        multipleImages={allImages}
                        multipleCurrentImageIndex={previewIndex}
                        src={imageSrc}
                        alt={`${item.title}, photo ${previewIndex + 1}`}
                        loading="lazy"
                        className="aspect-square w-full"
                        imageClassName="object-cover"
                      />
                      {isLast && (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-semibold tabular-nums backdrop-blur-sm"
                        >
                          +{overflowCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Click any photo to see it full size.</p>
            </SideSection>
          ) : undefined
        }
      >
        {item.detailsMd ? (
          <MarkdownBody content={item.detailsMd} className={PROSE_CLASS} />
        ) : (
          <p className="text-muted-foreground">
            {allImages.length > 1
              ? "A few photos from this one. Click any of them to see it full size."
              : "Click the photo to see it full size."}
          </p>
        )}
      </DetailBody>
    </DetailShell>
  );
}
