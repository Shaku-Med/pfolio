import React, { useRef, useState } from "react";
import { useInView } from "../../../hooks/useInView";
import { cn } from "~/lib/utils";
import { Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import ImgPreview from "./ImagePreview/ImgPreview";

const SAMPLE_SIZE = 64;
const BUCKET = 32; // round R,G,B to 32 steps for clustering
const MAX_COLORS = 5;

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

function getDominantColors(img: HTMLImageElement): string[] {
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, SAMPLE_SIZE / img.naturalWidth, SAMPLE_SIZE / img.naturalHeight);
    canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const count = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue;
      const br = Math.round(r / BUCKET) * BUCKET;
      const bg = Math.round(g / BUCKET) * BUCKET;
      const bb = Math.round(b / BUCKET) * BUCKET;
      const key = `${br},${bg},${bb}`;
      count.set(key, (count.get(key) ?? 0) + 1);
    }
    const sorted = [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_COLORS);
    return sorted.map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return rgbToHex(r, g, b);
    });
  } catch {
    return [];
  }
}

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

const ImgLoader = ({ src, alt, className, loading = "lazy", fetchPriority = "low", imageClassName = "", shouldShowPreview = false, multipleImages = [], multipleCurrentImageIndex = 0, getImgColors = false, onGetImgColorsCallback, onError }: ImgLoaderProps) => {
  const { ref, inView } = useInView();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
  }>({
    images: [],
    index: 0,
  });
  const shouldShowImage = inView && !error;

  const handleLoad = () => {
    setLoaded(true);
    if (getImgColors && onGetImgColorsCallback && imgRef.current) {
      const colors = getDominantColors(imgRef.current);
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

  const imageId = `img-loader-${multipleImages ? multipleImages[multipleCurrentImageIndex || 0] : src}`;
  return (
    <>
      <motion.div onClick={e => {
        if (shouldShowPreview) {
          setIsPreviewOpen(true);
          setPreviewData({
            images: multipleImages.length > 0 ? multipleImages : [src],
            index: multipleCurrentImageIndex || 0,
          });
          e.preventDefault();
          e.stopPropagation();
        }
      }} ref={ref} className={
        cn(
          "relative overflow-hidden",
          shouldShowPreview && "cursor-pointer",
          className
        )
      }>
        {/* Skeleton base while waiting or offscreen */}
        {!loaded && !error && (
          <Skeleton className="absolute inset-0" />
        )}

        {/* Image with loading spinner when in view */}
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
              className={
                cn(
                  "h-full w-full object-cover transition-opacity duration-300",
                  loaded ? "opacity-100" : "opacity-0",
                  imageClassName
                )
              }
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

        {/* Error state after retries */}
        {error && (
          <div className="flex h-full items-center justify-center rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-4 text-xs text-destructive">
            Unable to load image.
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        <ImgPreview images={previewData.images} index={previewData.index} isOpen={isPreviewOpen} setIsOpen={setIsPreviewOpen} />
      </AnimatePresence>
    </>
  );
};

export default ImgLoader;
