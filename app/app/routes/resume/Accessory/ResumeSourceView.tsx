import { useEffect, useState } from "react";
import { Check, Copy, Download, FileWarning } from "lucide-react";
import {
  LATEX_TOKEN_CLASS,
  tokenizeLatexLine,
} from "../../../lib/latex/highlight";

type ResumeSourceViewProps = {
  texUrl: string;
};

type SourceState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lines: string[]; raw: string };

/** Generous for a resume, small enough that a wrong URL can't hang the tab. */
const MAX_SOURCE_CHARS = 400_000;

type CopyState = "idle" | "done" | "error";

export const ResumeSourceView = ({ texUrl }: ResumeSourceViewProps) => {
  const [state, setState] = useState<SourceState>({ status: "loading" });
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(texUrl, { signal: controller.signal });
        if (!response.ok) {
          setState({
            status: "error",
            message: `Couldn't load the source (${response.status}).`,
          });
          return;
        }

        const raw = await response.text();

        // A missing public file can fall through to the SPA shell.
        if (/^\s*<(?:!doctype|html)\b/i.test(raw)) {
          setState({
            status: "error",
            message: "The .tex file isn't there yet.",
          });
          return;
        }

        const trimmed =
          raw.length > MAX_SOURCE_CHARS ? raw.slice(0, MAX_SOURCE_CHARS) : raw;
        setState({
          status: "ready",
          raw: trimmed,
          lines: trimmed.replace(/\r\n/g, "\n").split("\n"),
        });
      } catch {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: "Couldn't load the source." });
      }
    };

    void load();
    return () => controller.abort();
  }, [texUrl]);

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  // Fails on an insecure origin, where `navigator.clipboard` is undefined.
  // Say so rather than leaving a button that looks like it did nothing.
  const handleCopy = async () => {
    if (state.status !== "ready") return;
    try {
      await navigator.clipboard.writeText(state.raw);
      setCopyState("done");
    } catch {
      setCopyState("error");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = texUrl;
    a.download = "mohamed-amara-resume.tex";
    a.click();
  };

  if (state.status === "loading") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
        <div className="h-11 border-b border-border/60 bg-muted/30" />
        <div className="space-y-2 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-muted"
              style={{ width: `${40 + ((i * 17) % 50)}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-5 py-8 text-sm text-muted-foreground">
        <FileWarning className="h-4 w-4 shrink-0" />
        {state.message}
      </div>
    );
  }

  const gutterWidth = `${String(state.lines.length).length + 1}ch`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          resume.tex
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            {copyState === "done" ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : copyState === "error" ? (
              <FileWarning className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copyState === "done"
              ? "Copied"
              : copyState === "error"
                ? "Copy failed"
                : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            .tex
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <pre className="w-fit min-w-full py-3 font-mono text-[12px] leading-relaxed sm:text-[13px]">
          <code>
            {state.lines.map((line, i) => (
              <span key={i} className="flex">
                <span
                  aria-hidden
                  className="sticky left-0 shrink-0 select-none bg-muted/20 pr-4 pl-4 text-right text-muted-foreground/60 tabular-nums"
                  style={{ width: `calc(${gutterWidth} + 2rem)` }}
                >
                  {i + 1}
                </span>
                <span className="select-text! pr-4 whitespace-pre">
                  {tokenizeLatexLine(line).map((token, j) => (
                    <span key={j} className={LATEX_TOKEN_CLASS[token.kind]}>
                      {token.value}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
