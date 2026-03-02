import React from "react";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Download, ExternalLink, Maximize2, X } from "lucide-react";

type ResumePdfViewerProps = {
  pdfUrl: string;
};

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const ResumePdfViewer: React.FC<ResumePdfViewerProps> = ({ pdfUrl }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleOpenNewTab = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "mohamed-amara-resume.pdf";
    a.click();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Full screen
            </button>
          )}
        </div>

        {isMobile ? (
          <p className="rounded-xl border border-border/60 bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
            PDF preview isn't supported on most mobile browsers. Use the
            buttons above to open or download.
          </p>
        ) : (
          <div className="aspect-[8.5/11] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
            <iframe
              src={pdfUrl}
              title="Resume"
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          className="fixed inset-0 flex min-h-full min-w-full max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-background p-0 shadow-none [&>button]:hidden"
          style={{ borderRadius: 0, top: 0, left: 0, transform: "none" }}
        >
          {/* Top bar — sits above the iframe, not floating */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                New tab
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* PDF iframe — takes remaining space */}
          <iframe
            src={pdfUrl}
            title="Resume full screen"
            className="min-h-0 flex-1"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};