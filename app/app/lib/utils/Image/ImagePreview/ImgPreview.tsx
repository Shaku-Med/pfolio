import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCw,
  X,
  Maximize2,
  Download,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { motion, useReducedMotion } from "motion/react";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { useStandalone } from "~/hooks/useStandalone";
import { useAdaptiveTone, type Tone } from "~/lib/useAdaptiveTone";
import { getDominantColors } from "~/lib/utils/Image/colors";
import {
  getContainedViewportRect,
  loadImageDimensions,
  MORPH_DURATION,
  MORPH_EASE,
  type MorphOrigin,
} from "~/lib/utils/Image/ImagePreview/morph";
import { cn } from "~/lib/utils";

const AdaptiveCtx = createContext<{
  imageRef: RefObject<HTMLImageElement | null>;
  trigger: string;
} | null>(null);

const NULL_IMG_REF: RefObject<HTMLImageElement | null> = { current: null };

function useControlTone(targetRef: RefObject<HTMLElement | null>): Tone {
  const ctx = useContext(AdaptiveCtx);
  return useAdaptiveTone({
    imageRef: ctx?.imageRef ?? NULL_IMG_REF,
    targetRef,
    trigger: ctx?.trigger,
    defaultTone: "light",
  });
}

interface ImgPreviewProps {
  images: string[];
  index: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  colors?: string[];
  morphOrigin?: MorphOrigin | null;
}

export default function ImgPreview({
  images,
  index: initialIndex,
  isOpen,
  setIsOpen,
  colors: initialColors = [],
  morphOrigin = null,
}: ImgPreviewProps) {
  const isStandalone = useStandalone();
  const reduceMotion = useReducedMotion();

  const [current, setCurrent] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [imgColors, setImgColors] = useState<string[]>(initialColors);
  const [morphPhase, setMorphPhase] = useState<"enter" | "idle" | "exit">(
    morphOrigin && !reduceMotion ? "enter" : "idle",
  );
  const [morphTarget, setMorphTarget] = useState<Omit<
    MorphOrigin,
    "borderRadius"
  > | null>(null);
  const storedOrigin = useRef<MorphOrigin | null>(morphOrigin);
  const closingRef = useRef(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);

  const lastPinchDist = useRef(0);
  const lastPinchMid = useRef({ x: 0, y: 0 });
  const pinching = useRef(false);
  const gestureWasMultiTouch = useRef(false);
  const swipeStart = useRef<{ x: number; y: number; t: number } | null>(null);

  zoomRef.current = zoom;
  panRef.current = pan;

  useEffect(() => {
    setCurrent(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setCurrent((c) =>
      images.length < 1 ? 0 : Math.min(c, images.length - 1)
    );
  }, [images.length]);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }, [current]);

  useEffect(() => {
    if (isOpen && initialColors.length > 0) {
      setImgColors(initialColors);
    }
  }, [isOpen, initialColors]);

  const clampZoom = (z: number) => Math.min(Math.max(z, 1), 5);

  const getContainerCenter = () => {
    if (!containerRef.current) return { cx: 0, cy: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  };

  const clampPan = useCallback(
    (p: { x: number; y: number }, z: number) => {
      if (!containerRef.current) return p;
      const rect = containerRef.current.getBoundingClientRect();
      const overflowX = Math.max(0, (rect.width * (z - 1)) / 2);
      const overflowY = Math.max(0, (rect.height * (z - 1)) / 2);
      return {
        x: Math.min(overflowX, Math.max(-overflowX, p.x)),
        y: Math.min(overflowY, Math.max(-overflowY, p.y)),
      };
    },
    []
  );

  const zoomToward = useCallback(
    (clientX: number, clientY: number, newZoom: number) => {
      const oldZoom = zoomRef.current;
      const clamped = clampZoom(newZoom);
      if (clamped === oldZoom) return;

      const { cx, cy } = getContainerCenter();
      const px = clientX - cx - panRef.current.x;
      const py = clientY - cy - panRef.current.y;

      const scale = 1 - clamped / oldZoom;
      const nextPan = {
        x: panRef.current.x + px * scale,
        y: panRef.current.y + py * scale,
      };

      const clampedPan =
        clamped <= 1 ? { x: 0, y: 0 } : clampPan(nextPan, clamped);
      setZoom(clamped);
      setPan(clampedPan);
    },
    [clampPan]
  );

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current || 0);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    if (isOpen) resetHideTimer();
    return () => clearTimeout(hideTimer.current || 0);
  }, [isOpen, resetHideTimer]);

  const go = useCallback(
    (dir: -1 | 1) => {
      setCurrent((prev) => (prev + dir + images.length) % images.length);
    },
    [images.length]
  );

  const zoomIn = () => {
    const { cx, cy } = getContainerCenter();
    zoomToward(cx, cy, zoomRef.current + 0.5);
  };
  const zoomOut = () => {
    const { cx, cy } = getContainerCenter();
    zoomToward(cx, cy, zoomRef.current - 0.5);
  };
  const rotate = () => setRotation((r) => (r + 90) % 360);
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const src = images[current];
    const a = document.createElement("a");
    a.href = src;
    a.download = `image-${current + 1}`;
    a.click();
  };

  const canMorph = !!morphOrigin && !reduceMotion;

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    if (!canMorph || !storedOrigin.current || !morphTarget) {
      setIsOpen(false);
      return;
    }
    closingRef.current = true;
    setMorphPhase("exit");
  }, [canMorph, morphTarget, setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;
    storedOrigin.current = morphOrigin;
    closingRef.current = false;

    if (!canMorph) {
      setMorphPhase("idle");
      setMorphTarget(null);
      return;
    }

    setMorphPhase("enter");
    setMorphTarget(null);

    const src = images[initialIndex];
    if (!src) {
      setMorphPhase("idle");
      return;
    }

    let cancelled = false;
    loadImageDimensions(src)
      .then(({ width, height }) => {
        if (cancelled) return;
        setMorphTarget(getContainedViewportRect(width, height));
      })
      .catch(() => {
        if (!cancelled) setMorphPhase("idle");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, initialIndex, morphOrigin, canMorph, images]);

  const onMorphAnimationComplete = useCallback(() => {
    setMorphPhase((phase) => {
      if (phase === "enter") return "idle";
      if (phase === "exit") {
        closingRef.current = false;
        queueMicrotask(() => setIsOpen(false));
      }
      return phase;
    });
  }, [setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const blockBrowserKeyZoom = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", blockBrowserKeyZoom);
    return () => document.removeEventListener("keydown", blockBrowserKeyZoom);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      resetHideTimer();
      switch (e.key) {
        case "ArrowLeft":
          go(-1);
          break;
        case "ArrowRight":
          go(1);
          break;
        case "Escape":
          requestClose();
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) zoomIn();
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) zoomOut();
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) resetView();
          break;
        case "r":
          rotate();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, go, requestClose, resetHideTimer]);

  useEffect(() => {
    if (!isOpen) return;

    const onWheel = (e: WheelEvent) => {
      const el = containerRef.current;
      const over =
        !!el &&
        (e.target === el ||
          (e.target instanceof Node && el.contains(e.target)));
      const withModifier = e.ctrlKey || e.metaKey;
      if (!withModifier && !over) return;

      e.preventDefault();
      e.stopPropagation();
      resetHideTimer();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      zoomToward(e.clientX, e.clientY, zoomRef.current + delta);
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    return () => document.removeEventListener("wheel", onWheel);
  }, [isOpen, zoomToward, resetHideTimer]);

  const handlePointerDown = (e: React.PointerEvent) => {
    resetHideTimer();
    if (e.pointerType !== "mouse") return;
    if (pinching.current) return;
    if (zoomRef.current <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panRef.current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!dragging || pinching.current) return;
    const nextPan = {
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    };
    setPan(clampPan(nextPan, zoomRef.current));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setDragging(false);
  };

  const getPinchInfo = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return {
      dist: Math.hypot(dx, dy),
      midX: (touches[0].clientX + touches[1].clientX) / 2,
      midY: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    resetHideTimer();

    if (e.touches.length === 2) {
      pinching.current = true;
      gestureWasMultiTouch.current = true;
      swipeStart.current = null;
      const info = getPinchInfo(e.touches);
      lastPinchDist.current = info.dist;
      lastPinchMid.current = { x: info.midX, y: info.midY };
    } else if (e.touches.length === 1) {
      gestureWasMultiTouch.current = false;
      swipeStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        t: Date.now(),
      };

      if (zoomRef.current > 1) {
        setDragging(true);
        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        panStart.current = { ...panRef.current };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinching.current) {
      e.preventDefault();
      const info = getPinchInfo(e.touches);
      const scaleFactor = info.dist / lastPinchDist.current;
      const newZoom = zoomRef.current * scaleFactor;
      lastPinchDist.current = info.dist;
      zoomToward(info.midX, info.midY, newZoom);
      lastPinchMid.current = { x: info.midX, y: info.midY };
      swipeStart.current = null;
    } else if (e.touches.length === 1 && !pinching.current) {
      if (zoomRef.current > 1 && dragging) {
        const nextPan = {
          x: panStart.current.x + (e.touches[0].clientX - dragStart.current.x),
          y: panStart.current.y + (e.touches[0].clientY - dragStart.current.y),
        };
        setPan(clampPan(nextPan, zoomRef.current));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinching.current = false;
    }

    setDragging(false);

    if (
      swipeStart.current &&
      e.changedTouches.length === 1 &&
      zoomRef.current <= 1
    ) {
      const end = e.changedTouches[0];
      const dx = end.clientX - swipeStart.current.x;
      const dy = end.clientY - swipeStart.current.y;
      const dt = Date.now() - swipeStart.current.t;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > 50 && absDx > absDy * 1.3 && dt < 500) {
        go(dx < 0 ? 1 : -1);
        swipeStart.current = null;
        return;
      }
    }

    swipeStart.current = null;
  };

  const lastTap = useRef(0);
  const handleClick = (e: React.MouseEvent) => {
    if ((e as unknown as PointerEvent).pointerType === "touch") return;

    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (zoomRef.current > 1) {
        resetView();
      } else {
        zoomToward(e.clientX, e.clientY, 2);
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          setShowControls((s) => !s);
          if (!showControls) resetHideTimer();
        }
      }, 300);
    }
  };

  const lastTouch = useRef(0);
  const handleTouchEndTap = (e: React.TouchEvent) => {
    if (e.changedTouches.length !== 1 || pinching.current || gestureWasMultiTouch.current) return;

    const now = Date.now();
    const touch = e.changedTouches[0];

    if (now - lastTouch.current < 300) {
      if (zoomRef.current > 1) {
        resetView();
      } else {
        zoomToward(touch.clientX, touch.clientY, 2);
      }
      lastTouch.current = 0;
    } else {
      lastTouch.current = now;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    handleTouchEnd(e);
    handleTouchEndTap(e);
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgColors(getDominantColors(imgRef.current));
    }
  };

  const controlsClass = `transition-opacity duration-300 ${
    showControls && morphPhase === "idle"
      ? "opacity-100"
      : "opacity-0 pointer-events-none"
  }`;

  const stageVisible = morphPhase === "idle";
  const morphActive =
    canMorph &&
    morphOrigin &&
    morphTarget &&
    (morphPhase === "enter" || morphPhase === "exit");
  const morphImageSrc = images[initialIndex] ?? images[current];

  const adaptTrigger = useMemo(
    () => `${current}|${zoom}|${rotation}|${pan.x}|${pan.y}`,
    [current, zoom, rotation, pan.x, pan.y],
  );
  const adaptCtxValue = useMemo(
    () => ({ imageRef: imgRef, trigger: adaptTrigger }),
    [adaptTrigger],
  );

  if (images.length < 1) return null;

  const imageSrc = images[current];
  if (!imageSrc) return null;

  const hasMultiple = images.length > 1;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className="fixed inset-0 flex h-[100dvh] min-h-[100dvh] w-full min-w-full max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-transparent p-0 shadow-none data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 [&>button]:hidden"
        style={{ borderRadius: 0, top: 0, left: 0, transform: "none" }}
        onPointerMove={resetHideTimer}
      >
        <AdaptiveCtx.Provider value={adaptCtxValue}>
          <DialogTitle className="sr-only">
            Image preview{hasMultiple ? `, ${current + 1} of ${images.length}` : ""}
          </DialogTitle>

          {/* Backdrop — fades with morph */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[1] bg-black"
            initial={false}
            animate={{ opacity: morphPhase === "exit" ? 0 : morphTarget ? 0.92 : 0 }}
            transition={{ duration: MORPH_DURATION, ease: MORPH_EASE }}
          />

          {/* Source → fullscreen morph flight */}
          {morphActive && morphOrigin && morphTarget && morphImageSrc && (
            <motion.div
              aria-hidden
              className="fixed z-[2] overflow-hidden will-change-[top,left,width,height]"
              initial={
                morphPhase === "enter"
                  ? {
                      top: morphOrigin.top,
                      left: morphOrigin.left,
                      width: morphOrigin.width,
                      height: morphOrigin.height,
                      borderRadius: morphOrigin.borderRadius,
                    }
                  : {
                      top: morphTarget.top,
                      left: morphTarget.left,
                      width: morphTarget.width,
                      height: morphTarget.height,
                      borderRadius: 0,
                    }
              }
              animate={
                morphPhase === "enter"
                  ? {
                      top: morphTarget.top,
                      left: morphTarget.left,
                      width: morphTarget.width,
                      height: morphTarget.height,
                      borderRadius: 0,
                    }
                  : {
                      top: storedOrigin.current?.top ?? morphOrigin.top,
                      left: storedOrigin.current?.left ?? morphOrigin.left,
                      width: storedOrigin.current?.width ?? morphOrigin.width,
                      height: storedOrigin.current?.height ?? morphOrigin.height,
                      borderRadius: storedOrigin.current?.borderRadius ?? morphOrigin.borderRadius,
                    }
              }
              transition={{ duration: MORPH_DURATION, ease: MORPH_EASE }}
              onAnimationComplete={onMorphAnimationComplete}
            >
              <img
                src={morphImageSrc}
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
            </motion.div>
          )}

          {/* Full-screen stage — canvas is fixed bg; only the image transforms */}
          <motion.div
            ref={containerRef}
            className="absolute inset-0 z-[3] flex items-center justify-center overflow-hidden bg-transparent"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleClick}
            style={{
              cursor:
                zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
              pointerEvents: stageVisible ? "auto" : "none",
            }}
            initial={false}
            animate={{ opacity: stageVisible ? 1 : 0 }}
            transition={{ duration: stageVisible ? 0 : 0.12, ease: MORPH_EASE }}
          >
            <CanvasGradient colors={imgColors} />
            <div
              className="relative z-10 flex h-full w-full items-center justify-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition:
                  dragging || pinching.current
                    ? "none"
                    : "transform 150ms ease-out",
                willChange: "transform",
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt=""
                crossOrigin="anonymous"
                className="h-full w-full max-h-[100dvh] max-w-[100dvw] select-none object-contain"
                loading="eager"
                fetchPriority="high"
                draggable={false}
                onLoad={handleImageLoad}
              />
            </div>
          </motion.div>

          {/* Top bar */}
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/70 to-transparent px-4 pb-6 ${
              isStandalone
                ? "pt-[max(0.75rem,env(safe-area-inset-top))]"
                : "pt-3 sm:pt-4"
            }`}
          >
            <div className={`pointer-events-auto flex items-center justify-between gap-3 ${controlsClass}`}>
              {hasMultiple ? (
                <ToneText className="text-sm font-medium tabular-nums">
                  {current + 1} / {images.length}
                </ToneText>
              ) : (
                <span className="text-sm font-medium text-white/80">Preview</span>
              )}

              <div className="hidden items-center gap-1 sm:flex">
                <ToolButton onClick={zoomOut} label="Zoom out" disabled={zoom <= 1}>
                  <Minus className="h-4 w-4" />
                </ToolButton>
                <ToneText className="min-w-[3rem] text-center text-xs" light="text-white/60" dark="text-black/60">
                  {Math.round(zoom * 100)}%
                </ToneText>
                <ToolButton onClick={zoomIn} label="Zoom in" disabled={zoom >= 5}>
                  <Plus className="h-4 w-4" />
                </ToolButton>
                <Divider />
                <ToolButton onClick={rotate} label="Rotate">
                  <RotateCw className="h-4 w-4" />
                </ToolButton>
                <ToolButton onClick={resetView} label="Reset view">
                  <Maximize2 className="h-4 w-4" />
                </ToolButton>
                <ToolButton onClick={handleDownload} label="Download">
                  <Download className="h-4 w-4" />
                </ToolButton>
                <Divider />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  requestClose();
                }}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-white shadow-sm ring-1 ring-white/10 transition-colors hover:bg-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile toolbar */}
          <div
            className={`absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-md sm:hidden ${controlsClass}`}
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-center gap-2 px-3 pb-2 pt-4">
              <ToolButton onClick={zoomOut} label="Zoom out" disabled={zoom <= 1}>
                <Minus className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={zoomIn} label="Zoom in" disabled={zoom >= 5}>
                <Plus className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={rotate} label="Rotate">
                <RotateCw className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={resetView} label="Reset">
                <Maximize2 className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={handleDownload} label="Download">
                <Download className="h-4 w-4" />
              </ToolButton>
            </div>

            {hasMultiple && (
              <ThumbnailStrip
                images={images}
                current={current}
                onSelect={setCurrent}
                size="sm"
              />
            )}
          </div>

          {/* Desktop toolbar + thumbnails */}
          <div
            className={`absolute inset-x-0 bottom-0 z-30 hidden border-t border-white/10 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-md sm:block ${controlsClass}`}
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            {hasMultiple && (
              <ThumbnailStrip
                images={images}
                current={current}
                onSelect={setCurrent}
                size="md"
              />
            )}
          </div>

          {hasMultiple && (
            <div className={controlsClass}>
              <NavArrow direction="prev" onClick={() => go(-1)} />
              <NavArrow direction="next" onClick={() => go(1)} />
            </div>
          )}
        </AdaptiveCtx.Provider>
      </DialogContent>
    </Dialog>
  );
}

function ThumbnailStrip({
  images,
  current,
  onSelect,
  size,
}: {
  images: string[];
  current: number;
  onSelect: (index: number) => void;
  size: "sm" | "md";
}) {
  const thumb = size === "sm" ? "h-10 w-10 rounded-md" : "h-14 w-14 rounded-lg";
  return (
    <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-3 pt-2 scrollbar-none">
      {images.map((img, i) => (
        <button
          key={`${img}-${i}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(i);
          }}
          className={cn(
            "shrink-0 overflow-hidden transition-all",
            thumb,
            i === current
              ? "ring-2 ring-white ring-offset-2 ring-offset-black opacity-100"
              : "opacity-45 hover:opacity-75",
          )}
        >
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

function ToolButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const tone = useControlTone(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full ring-1 transition-colors disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2",
        tone === "light"
          ? "bg-white/10 text-white/85 ring-white/10 hover:bg-white/22 hover:text-white focus-visible:ring-white/35"
          : "bg-black/15 text-black/85 ring-black/10 hover:bg-black/25 hover:text-black focus-visible:ring-black/35",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-4 w-px bg-white/20" />;
}

function ToneText({
  children,
  className,
  light = "text-white/90",
  dark = "text-black/90",
}: {
  children: React.ReactNode;
  className?: string;
  light?: string;
  dark?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const tone = useControlTone(ref);
  return (
    <span ref={ref} className={cn(tone === "light" ? light : dark, className)}>
      {children}
    </span>
  );
}

function NavArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const tone = useControlTone(ref);
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full shadow-md ring-1 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 sm:h-12 sm:w-12",
        direction === "prev" ? "left-3 sm:left-5" : "right-3 sm:right-5",
        tone === "light"
          ? "bg-black/40 text-white ring-white/10 hover:bg-black/55 focus-visible:ring-white/35"
          : "bg-white/60 text-black ring-black/10 hover:bg-white/75 focus-visible:ring-black/35",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
