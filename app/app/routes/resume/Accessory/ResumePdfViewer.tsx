import React from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { ExternalLink, FileText, Maximize2, X } from "lucide-react";
import { Skeleton } from "../../../components/ui/skeleton";
import { MORPH_DURATION, MORPH_EASE } from "~/lib/utils/Image/ImagePreview/morph";

type ResumePdfViewerProps = {
  pdfUrl: string;
};

type Box = { top: number; left: number; width: number; height: number };

// The site CSP has object-src 'none', so the PDF goes in an iframe, not <object>.
const viewerSrc = (url: string) => `${url}#toolbar=0&navpanes=0&view=FitH`;

const CARD_RADIUS = 16;
const FILE_NAME = "mohamed-amara-resume.pdf";

const buttonClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

function boxOf(el: HTMLElement): Box {
  const { top, left, width, height } = el.getBoundingClientRect();
  return { top, left, width, height };
}

function viewportBox(): Box {
  return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
}

const ViewerBar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3 sm:px-4">
    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">{FILE_NAME}</span>
    </div>
    <div className="flex shrink-0 items-center gap-1">{children}</div>
  </div>
);

type FullscreenProps = {
  pdfUrl: string;
  origin: Box;
  closing: boolean;
  onRequestClose: () => void;
  onClosed: () => void;
};

const FullscreenViewer = ({ pdfUrl, origin, closing, onRequestClose, onClosed }: FullscreenProps) => {
  const reduceMotion = useReducedMotion();
  const [viewport, setViewport] = React.useState<Box>(viewportBox);
  const [settled, setSettled] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onResize = () => setViewport(viewportBox());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onRequestClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [onRequestClose]);

  const transition = reduceMotion
    ? { duration: 0.18 }
    : { duration: MORPH_DURATION, ease: MORPH_EASE };
  const atCard = { ...origin, borderRadius: CARD_RADIUS, opacity: reduceMotion ? 0 : 1 };
  const atFull = { ...viewport, borderRadius: 0, opacity: 1 };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Resume full screen" className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-background/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={transition}
        onClick={onRequestClose}
      />
      {/* The shell grows from the card while its contents stay full size, so nothing reflows mid flight. */}
      <motion.div
        className="absolute overflow-hidden border border-border bg-card shadow-2xl"
        initial={atCard}
        animate={closing ? atCard : atFull}
        transition={transition}
        onAnimationComplete={() => (closing ? onClosed() : setSettled(true))}
      >
        <div className="absolute left-0 top-0 flex flex-col" style={{ width: viewport.width, height: viewport.height }}>
          <ViewerBar>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New tab</span>
            </a>
            <button
              ref={closeRef}
              type="button"
              onClick={onRequestClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </ViewerBar>
          <div className="relative min-h-0 flex-1 bg-muted">
            <iframe
              src={viewerSrc(pdfUrl)}
              title="Resume full screen"
              onLoad={() => setLoaded(true)}
              className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                loaded && settled && !closing ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

export const ResumePdfViewer: React.FC<ResumePdfViewerProps> = ({ pdfUrl }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const expandRef = React.useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState<{ origin: Box; closing: boolean } | null>(null);
  // Resolved after mount, since reading the UA during render would desync SSR.
  const [canEmbed, setCanEmbed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setCanEmbed(!mobile && navigator.pdfViewerEnabled !== false);
  }, []);

  const openFullscreen = () => {
    if (cardRef.current) setFullscreen({ origin: boxOf(cardRef.current), closing: false });
  };

  const requestClose = React.useCallback(() => {
    setFullscreen((current) =>
      current && !current.closing && cardRef.current
        ? { origin: boxOf(cardRef.current), closing: true }
        : current,
    );
  }, []);

  const handleClosed = React.useCallback(() => setFullscreen(null), []);

  // Waits for the card to be visible again, since hidden elements can't take focus.
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (fullscreen) wasOpen.current = true;
    else if (wasOpen.current) {
      wasOpen.current = false;
      expandRef.current?.focus({ preventScroll: true });
    }
  }, [fullscreen]);

  return (
    <>
      <div
        ref={cardRef}
        className={`mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
          fullscreen ? "invisible" : ""
        }`}
      >
        <ViewerBar>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open</span>
          </a>
          {canEmbed && (
            <button ref={expandRef} type="button" onClick={openFullscreen} className={buttonClass}>
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Full screen</span>
            </button>
          )}
        </ViewerBar>

        {canEmbed === false ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Phones don't show PDFs inside a page very well, so it opens on its own.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open the PDF
            </a>
          </div>
        ) : (
          <div className="relative aspect-[8.5/11] w-full bg-muted">
            {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
            {canEmbed && (
              <iframe
                src={viewerSrc(pdfUrl)}
                title="Resume PDF"
                onLoad={() => setLoaded(true)}
                className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </div>
        )}
      </div>

      {fullscreen && (
        <FullscreenViewer
          pdfUrl={pdfUrl}
          origin={fullscreen.origin}
          closing={fullscreen.closing}
          onRequestClose={requestClose}
          onClosed={handleClosed}
        />
      )}
    </>
  );
};
