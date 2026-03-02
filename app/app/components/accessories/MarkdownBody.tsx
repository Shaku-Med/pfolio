import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import React from "react";

const proseClasses =
  "prose prose-sm prose-neutral dark:prose-invert max-w-none " +
  "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground " +
  "prose-p:text-muted-foreground prose-p:leading-relaxed " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-foreground prose-strong:font-semibold " +
  "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none " +
  "prose-pre:bg-muted prose-pre:border prose-pre:border-border/60 prose-pre:text-sm " +
  "prose-ul:text-muted-foreground prose-ol:text-muted-foreground " +
  "prose-blockquote:border-primary/40 prose-blockquote:italic prose-blockquote:text-muted-foreground " +
  "prose-img:rounded-lg prose-img:border prose-img:border-border/60";

type MarkdownBodyProps = {
  content: string;
  className?: string;
};

export default function MarkdownBody({ content, className = "" }: MarkdownBodyProps) {
  const [MdMarkdown, setMdMarkdown] = useState<
    ((props: { source: string; className?: string }) => React.JSX.Element) | null
  >(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    import("@uiw/react-md-editor")
      .then((mod: any) => {
        if (!mounted) return;
        const Comp =
          (mod.default && mod.default.Markdown) || mod.Markdown;
        setMdMarkdown(() => Comp);
      })
      .catch(() => {
        if (mounted) setMdMarkdown(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Ensure all links inside the rendered markdown open in a new tab.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const anchors = el.querySelectorAll<HTMLAnchorElement>("a[href]");
    anchors.forEach((a) => {
      a.target = "_blank";
      const rel = a.getAttribute("rel") || "";
      const parts = new Set(
        rel
          .split(" ")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      parts.add("noopener");
      parts.add("noreferrer");
      a.setAttribute("rel", Array.from(parts).join(" "));
    });
  }, [MdMarkdown, content]);

  return (
    <div ref={containerRef} className={`${proseClasses} ${className}`}>
      {MdMarkdown ? (
        <MdMarkdown
          source={DOMPurify.sanitize(content)}
          className="!bg-transparent markdown_pv"
        />
      ) : (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}
    </div>
  );
}
