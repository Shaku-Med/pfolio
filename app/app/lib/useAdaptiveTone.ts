import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type Tone = "light" | "dark";

export interface UseAdaptiveToneOptions {
  imageRef: RefObject<HTMLImageElement | null>;
  targetRef: RefObject<HTMLElement | null>;
  defaultTone?: Tone;
  trigger?: unknown;
  sampleSize?: number;
  threshold?: number;
  objectFit?: "contain" | "fill";
}

const sharedCanvas =
  typeof document !== "undefined" ? document.createElement("canvas") : null;

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function useAdaptiveTone(opts: UseAdaptiveToneOptions): Tone {
  const {
    imageRef,
    targetRef,
    defaultTone = "light",
    trigger,
    sampleSize = 16,
    threshold = 0.18,
    objectFit = "contain",
  } = opts;

  const [tone, setTone] = useState<Tone>(defaultTone);
  const rafRef = useRef<number>(0);

  const sample = useCallback(() => {
    if (!sharedCanvas) return;
    const img = imageRef.current;
    const target = targetRef.current;
    if (!img || !target) return;
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;

    const imgRect = img.getBoundingClientRect();
    if (imgRect.width < 1 || imgRect.height < 1) return;

    let contentLeft = imgRect.left;
    let contentTop = imgRect.top;
    let contentWidth = imgRect.width;
    let contentHeight = imgRect.height;
    if (objectFit === "contain") {
      const scale = Math.min(
        imgRect.width / img.naturalWidth,
        imgRect.height / img.naturalHeight,
      );
      contentWidth = img.naturalWidth * scale;
      contentHeight = img.naturalHeight * scale;
      contentLeft = imgRect.left + (imgRect.width - contentWidth) / 2;
      contentTop = imgRect.top + (imgRect.height - contentHeight) / 2;
    }
    const contentRight = contentLeft + contentWidth;
    const contentBottom = contentTop + contentHeight;

    const tgtRect = target.getBoundingClientRect();
    const ix1 = Math.max(contentLeft, tgtRect.left);
    const iy1 = Math.max(contentTop, tgtRect.top);
    const ix2 = Math.min(contentRight, tgtRect.right);
    const iy2 = Math.min(contentBottom, tgtRect.bottom);
    if (ix2 <= ix1 || iy2 <= iy1) {
      setTone(defaultTone);
      return;
    }

    const sScale = img.naturalWidth / contentWidth;
    const sx = (ix1 - contentLeft) * sScale;
    const sy = (iy1 - contentTop) * sScale;
    const sw = (ix2 - ix1) * sScale;
    const sh = (iy2 - iy1) * sScale;
    if (sw < 1 || sh < 1) return;

    sharedCanvas.width = sampleSize;
    sharedCanvas.height = sampleSize;
    const ctx = sharedCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    try {
      ctx.clearRect(0, 0, sampleSize, sampleSize);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);
      const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
      let sum = 0;
      let counted = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        sum += relLuminance(data[i], data[i + 1], data[i + 2]);
        counted++;
      }
      if (counted === 0) {
        setTone(defaultTone);
        return;
      }
      const avg = sum / counted;
      setTone(avg < threshold ? "light" : "dark");
    } catch {
      // Tainted canvas: keep current tone.
    }
  }, [imageRef, targetRef, sampleSize, threshold, objectFit, defaultTone]);

  useEffect(() => {
    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(sample);
    };

    schedule();

    const img = imageRef.current;
    const onLoad = () => schedule();
    img?.addEventListener("load", onLoad);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      img?.removeEventListener("load", onLoad);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [sample, trigger]);

  return tone;
}
