import React from "react";
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog";
import { ExternalLink, FileText, Maximize2, X } from "lucide-react";
import { Skeleton } from "../../../components/ui/skeleton";

type ResumePdfViewerProps = {
  pdfUrl: string;
};

// The site CSP has object-src 'none', so the PDF goes in an iframe, not <object>.
const viewerSrc = (url: string) => `${url}#toolbar=0&navpanes=0&view=FitH`;

const buttonClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export const ResumePdfViewer: React.FC<ResumePdfViewerProps> = ({ pdfUrl }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  // Resolved after mount, since reading the UA during render would desync SSR.
  const [canEmbed, setCanEmbed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setCanEmbed(!mobile && navigator.pdfViewerEnabled !== false);
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">mohamed-amara-resume.pdf</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>
            {canEmbed && (
              <button type="button" onClick={() => setIsFullscreen(true)} className={buttonClass}>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Full screen</span>
              </button>
            )}
          </div>
        </div>

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

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          aria-describedby={undefined}
          className="fixed inset-0 flex min-h-full min-w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 border-0 bg-background p-0 shadow-none [&>button]:hidden"
          style={{ borderRadius: 0, top: 0, left: 0, transform: "none" }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <DialogTitle className="flex min-w-0 items-center gap-2 text-sm font-normal text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">mohamed-amara-resume.pdf</span>
            </DialogTitle>
            <div className="flex items-center gap-1">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                <ExternalLink className="h-3.5 w-3.5" />
                New tab
              </a>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <iframe src={viewerSrc(pdfUrl)} title="Resume full screen" className="min-h-0 w-full flex-1 bg-muted" />
        </DialogContent>
      </Dialog>
    </>
  );
};
