import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { allowMarkdownElement } from "~/lib/markdown";
import { FileText } from "lucide-react";

type MarkdownPreviewProps = {
  content: string;
  title?: string;
};

type MdMarkdownComponent = (props: {
  source: string;
  className?: string;
  allowElement?: typeof allowMarkdownElement;
}) => React.JSX.Element;

export function MarkdownPreview({
  content,
  title = "Detailed Information",
}: MarkdownPreviewProps) {
  const [contentState, setContentState] = useState("");
  const [MdMarkdown, setMdMarkdown] = useState<MdMarkdownComponent | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    setContentState(content);
  }, [content]);

  useEffect(() => {
    let mounted = true;
    import("@uiw/react-md-editor")
      .then((mod: any) => {
        if (!mounted) return;
        const Comp: MdMarkdownComponent =
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
  }, [MdMarkdown, contentState]);

  if (!content) return null;

  return (
    <>
      <div className="space-y-4" ref={containerRef}>
        <div data-color-mode="dark">
          {MdMarkdown && contentState ? (
            <MdMarkdown
              source={contentState}
              allowElement={allowMarkdownElement}
              className="!bg-transparent markdown_pv"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </div>
      </div>
    </>
  );
}


