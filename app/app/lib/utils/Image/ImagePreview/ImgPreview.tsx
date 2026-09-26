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
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
// Background color generation is off; the preview uses a frosted backdrop instead.
// import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { useStandalone } from "~/hooks/useStandalone";
import { useAdaptiveTone, type Tone } from "~/lib/useAdaptiveTone";
// import { getDominantColors } from "~/lib/utils/Image/colors";
import {
  captureMorphOrigin,
  findPreviewElement,
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
  // colors: initialColors = [],
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
  // const [imgColors, setImgColors] = useState<string[]>(initialColors);
  const [morphPhase, setMorphPhase] = useState<"enter" | "idle" | "exit">(
    morphOrigin && !reduceMotion ? "enter" : "idle",
  );
  const [morphTarget, setMorphTarget] = useState<Omit<
    MorphOrigin,
    "borderRadius"
  > | null>(null);
  const storedOrigin = useRef<MorphOrigin | null>(morphOrigin);
  const closingRef = useRef(false);
  // Closing flies back to whichever photo is current, not the one that opened.
  const [exitFlight, setExitFlight] = useState<{ from: MorphOrigin; to: MorphOrigin; src: string } | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const hiddenTarget = useRef<HTMLElement | null>(null);

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

  // Drag up or down to close, like the Photos app. Only when not zoomed in.
  const dragY = useMotionValue(0);
  const dragScale = useTransform(dragY, [-400, 0, 400], [0.86, 1, 0.86]);
  const dragFade = useTransform(dragY, [-360, 0, 360], [0, 1, 0]);
  const dismiss = useRef<{ x: number; y: number; t: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [draggingToClose, setDraggingToClose] = useState(false);

  // A plain dark tint over the page. No blur: backdrop-filter is slow or broken
  // on some devices.
  const backdropLevel = useMotionValue(0);
  const backdropStrength = useTransform(() => backdropLevel.get() * dragFade.get());
  const backdropColor = useTransform(backdropStrength, (v) => `rgba(0, 0, 0, ${(0.72 * v).toFixed(3)})`);

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
    dragY.set(0);
  }, [current, dragY]);

  // useEffect(() => {
  //   if (isOpen && initialColors.length > 0) {
  //     setImgColors(initialColors);
  //   }
  // }, [isOpen, initialColors]);

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

  const revealedOpener = useRef<HTMLElement | null>(null);
  const restoreHiddenTarget = useCallback(() => {
    if (hiddenTarget.current) hiddenTarget.current.style.visibility = "";
    if (revealedOpener.current) revealedOpener.current.style.visibility = "";
    hiddenTarget.current = null;
    revealedOpener.current = null;
  }, []);

  // The photo that opened the preview stays hidden while it is open. When the
  // preview closes onto a different photo, bring that first one back right away.
  const revealOpener = useCallback(() => {
    const openerSrc = images[initialIndex];
    if (!openerSrc || openerSrc === images[current]) return;
    const opener = findPreviewElement(openerSrc);
    if (!opener) return;
    opener.style.visibility = "visible";
    revealedOpener.current = opener;
  }, [images, initialIndex, current]);

  // Close timers can outlive this preview; a stale one must not close the next.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const finishClose = useCallback(() => {
    restoreHiddenTarget();
    if (mounted.current) setIsOpen(false);
  }, [restoreHiddenTarget, setIsOpen]);

  /** Where the current photo sits on screen right now, drag, zoom and pan included. */
  const displayedRect = useCallback((): MorphOrigin | null => {
    const img = imgRef.current;
    if (!img?.naturalWidth || rotation % 360 !== 0) return null;
    const base = getContainedViewportRect(img.naturalWidth, img.naturalHeight);
    const outer = dragScale.get();
    const size = zoomRef.current * outer;
    const width = base.width * size;
    const height = base.height * size;
    const cx = window.innerWidth / 2 + panRef.current.x * outer;
    const cy = window.innerHeight / 2 + panRef.current.y * outer + dragY.get();
    return { top: cy - height / 2, left: cx - width / 2, width, height, borderRadius: 0 };
  }, [rotation, dragScale, dragY]);

  /** Returns true when a flight back to the page started. */
  const flyBackToPage = useCallback(() => {
    const src = images[current];
    const el = !reduceMotion && src ? findPreviewElement(src) : null;
    const from = el ? displayedRect() : null;
    if (!el || !from || !src) return false;

    if (el.style.visibility !== "hidden") {
      el.style.visibility = "hidden";
      hiddenTarget.current = el;
    }
    revealOpener();
    setExitFlight({ from, to: captureMorphOrigin(el), src });
    setMorphPhase("exit");
    // Animation frames pause in background tabs; never leave the preview stuck open.
    window.setTimeout(finishClose, MORPH_DURATION * 1000 + 200);
    return true;
  }, [images, current, reduceMotion, displayedRect, finishClose, revealOpener]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (flyBackToPage()) return;
    if (reduceMotion) {
      finishClose();
      return;
    }
    // The photo is not on the page (hidden in "+3" or scrolled away): just fade out.
    revealOpener();
    setFadingOut(true);
    window.setTimeout(finishClose, 180);
  }, [flyBackToPage, reduceMotion, finishClose, revealOpener]);

  useEffect(() => restoreHiddenTarget, [restoreHiddenTarget]);

  useEffect(() => {
    if (!isOpen) return;
    const visible = !fadingOut && morphPhase !== "exit" && (!canMorph || Boolean(morphTarget));
    const controls = animate(backdropLevel, visible ? 1 : 0, {
      duration: reduceMotion ? 0 : MORPH_DURATION,
      ease: MORPH_EASE,
    });
    return () => controls.stop();
  }, [isOpen, morphPhase, morphTarget, canMorph, reduceMotion, backdropLevel, fadingOut]);

  const beginDismiss = (x: number, y: number) => {
    dismiss.current = { x, y, t: performance.now(), active: false };
  };

  /** Returns true once the gesture has become a vertical drag. */
  const moveDismiss = (x: number, y: number) => {
    const d = dismiss.current;
    if (!d) return false;
    const dx = x - d.x;
    const dy = y - d.y;
    if (!d.active) {
      if (Math.abs(dy) < 8 || Math.abs(dy) <= Math.abs(dx)) return false;
      d.active = true;
      setDraggingToClose(true);
    }
    dragY.set(dy);
    return true;
  };

  /** Returns true when the gesture was a drag, so taps and swipes can ignore it. */
  const endDismiss = (y: number) => {
    const d = dismiss.current;
    dismiss.current = null;
    if (!d?.active) return false;
    setDraggingToClose(false);
    suppressClick.current = true;

    const dy = y - d.y;
    const velocity = dy / Math.max(1, performance.now() - d.t);
    if (Math.abs(dy) > 110 || Math.abs(velocity) > 0.6) {
      closingRef.current = true;
      if (reduceMotion) {
        setIsOpen(false);
        return true;
      }
      if (flyBackToPage()) return true;
      // The photo is not on the page, so it flies off the way it was thrown.
      const direction = dy < 0 ? -1 : 1;
      animate(dragY, direction * window.innerHeight, { duration: 0.22, ease: [0.32, 0.72, 0, 1] }).then(finishClose);
      // Animation frames pause in background tabs; never leave the preview stuck open.
      window.setTimeout(finishClose, 320);
    } else {
      animate(dragY, 0, { type: "spring", stiffness: 420, damping: 36 });
    }
    return true;
  };

  useEffect(() => {
    if (!isOpen) return;
    storedOrigin.current = morphOrigin;
    closingRef.current = false;
    setExitFlight(null);
    setFadingOut(false);

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
      if (phase === "exit") queueMicrotask(finishClose);
      return phase;
    });
  }, [finishClose]);

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
    if (zoomRef.current <= 1) {
      if (e.button === 0) {
        beginDismiss(e.clientX, e.clientY);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
      return;
    }
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panRef.current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (dismiss.current) {
      moveDismiss(e.clientX, e.clientY);
      return;
    }
    if (!dragging || pinching.current) return;
    const nextPan = {
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    };
    setPan(clampPan(nextPan, zoomRef.current));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (dismiss.current) endDismiss(e.clientY);
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
      } else {
        beginDismiss(e.touches[0].clientX, e.touches[0].clientY);
      }
    } else {
      dismiss.current = null;
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
      if (zoomRef.current <= 1 && moveDismiss(e.touches[0].clientX, e.touches[0].clientY)) {
        swipeStart.current = null;
        return;
      }
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

    if (dismiss.current && e.changedTouches.length === 1 && endDismiss(e.changedTouches[0].clientY)) {
      swipeStart.current = null;
      return;
    }

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
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
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
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
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

  // const handleImageLoad = () => {
  //   if (imgRef.current) {
  //     setImgColors(getDominantColors(imgRef.current));
  //   }
  // };

  const controlsClass = `transition-opacity duration-300 ${
    showControls && morphPhase === "idle" && !draggingToClose
      ? "opacity-100"
      : "opacity-0 pointer-events-none"
  }`;

  const stageVisible = morphPhase === "idle";
  const flight =
    morphPhase === "enter" && canMorph && morphOrigin && morphTarget && images[initialIndex]
      ? { from: morphOrigin, to: { ...morphTarget, borderRadius: 0 }, src: images[initialIndex] }
      : morphPhase === "exit" && exitFlight
        ? exitFlight
        : null;

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

          {/* Backdrop fades with the morph */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[1]"
            style={{ backgroundColor: backdropColor }}
          />

          {/* Flight between the page and full screen, both ways */}
          {flight && (
            <motion.div
              key={`${morphPhase}-${flight.src}`}
              aria-hidden
              className="fixed z-[2] overflow-hidden will-change-[top,left,width,height]"
              initial={{
                top: flight.from.top,
                left: flight.from.left,
                width: flight.from.width,
                height: flight.from.height,
                borderRadius: flight.from.borderRadius,
              }}
              animate={{
                top: flight.to.top,
                left: flight.to.left,
                width: flight.to.width,
                height: flight.to.height,
                borderRadius: flight.to.borderRadius,
              }}
              transition={{ duration: MORPH_DURATION, ease: MORPH_EASE }}
              onAnimationComplete={onMorphAnimationComplete}
            >
              {/* cover matches the cropped thumbnail at one end and the exact photo at the other */}
              <img src={flight.src} alt="" className="h-full w-full object-cover" draggable={false} />
            </motion.div>
          )}

          {/* Full screen stage: canvas is a fixed bg and only the image transforms */}
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
            animate={{ opacity: stageVisible && !fadingOut ? 1 : 0 }}
            transition={{ duration: stageVisible ? 0 : 0.12, ease: MORPH_EASE }}
          >
            {/* <CanvasGradient colors={imgColors} /> */}
            <motion.div
              className="relative z-10 flex h-full w-full items-center justify-center"
              style={{ y: dragY, scale: dragScale }}
            >
              <div
                className="flex h-full w-full items-center justify-center"
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
                />
              </div>
            </motion.div>
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
