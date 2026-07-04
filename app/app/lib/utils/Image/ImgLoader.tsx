import React, { useRef, useState } from "react";
import { useInView } from "../../../hooks/useInView";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import ImgPreview from "./ImagePreview/ImgPreview";
import { getDominantColors } from "./colors";
import {
  captureMorphOrigin,
  type MorphOrigin,
} from "./ImagePreview/morph";

interface ImgLoaderProps {
  src: string;
  alt: string;
  /** Classes applied to the outer container. The image fills it. */
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low";
  imageClassName?: string;
  shouldShowPreview?: boolean;
  multipleImages?: string[];
  multipleCurrentImageIndex?: number;
  getImgColors?: boolean;
  onGetImgColorsCallback?: (colors: string[]) => void;
  onError?: () => void;
}

const ImgLoader = ({
  src,
  alt,
  className,
  loading = "lazy",
  fetchPriority = "low",
  imageClassName = "",
  shouldShowPreview = false,
  multipleImages = [],
  multipleCurrentImageIndex = 0,
  getImgColors = false,
  onGetImgColorsCallback,
  onError,
}: ImgLoaderProps) => {
  const { ref, inView } = useInView();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [morphOrigin, setMorphOrigin] = useState<MorphOrigin | null>(null);
  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
  }>({
    images: [],
    index: 0,
  });

  const shouldShowImage = inView && !error;
  const previewImages =
    multipleImages.length > 0 ? multipleImages : [src];

  const handleLoad = () => {
    setLoaded(true);
    if (getImgColors && onGetImgColorsCallback && imgRef.current) {
      const colors = getDominantColors(imgRef.current);
      setExtractedColors(colors);
      onGetImgColorsCallback(colors);
    }
  };

  const handleError = () => {
    if (attempt < 2) {
      setAttempt((prev) => prev + 1);
      setLoaded(false);
      setRetryKey((prev) => prev + 1);
      return;
    }
    setError(true);
    onError?.();
  };

  const computedSrc =
    attempt === 0
      ? src
      : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;

  const openPreview = (e: React.MouseEvent) => {
    if (!shouldShowPreview || !imgRef.current) return;
    setMorphOrigin(captureMorphOrigin(imgRef.current));
    setPreviewData({
      images: previewImages,
      index: multipleCurrentImageIndex ?? 0,
    });
    setIsPreviewOpen(true);
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <motion.div
        onClick={openPreview}
        ref={ref}
        className={cn(
          "group relative overflow-hidden",
          shouldShowPreview && "cursor-zoom-in",
          className
        )}
      >
        {!loaded && !error && <Skeleton className="absolute inset-0" />}

        {shouldShowImage && (
          <>
            <img
              ref={imgRef}
              key={retryKey}
              src={computedSrc}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              crossOrigin={getImgColors ? "anonymous" : undefined}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                loaded ? "opacity-100" : "opacity-0",
                isPreviewOpen && shouldShowPreview && "invisible",
                imageClassName
              )}
              fetchPriority={fetchPriority}
              loading={loading || "lazy"}
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-transparent" />
              </div>
            )}
          </>
        )}

        {shouldShowPreview && loaded && !error && !isPreviewOpen && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="m-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
              View
            </span>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-4 text-xs text-destructive">
            Unable to load image.
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isPreviewOpen && (
          <ImgPreview
            images={previewData.images}
            index={previewData.index}
            isOpen={isPreviewOpen}
            setIsOpen={setIsPreviewOpen}
            colors={extractedColors}
            morphOrigin={morphOrigin}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ImgLoader;
