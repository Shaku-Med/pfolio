import type { ElementType, ReactNode } from "react";

type Props = {
  text: string;
  className?: string;
  /** Use for cards with line-clamp — keeps a single element. */
  as?: ElementType;
  /** Split on blank lines into real paragraphs (detail pages). */
  paragraphs?: boolean;
};

/**
 * Renders plain DB text so `\n` / `\r\n` show as line breaks.
 * With `paragraphs`, blank lines become separate `<p>` blocks.
 */
export function TextBlock({
  text,
  className = "",
  as: Tag = "p",
  paragraphs = false,
}: Props) {
  const normalized = String(text ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;

  if (paragraphs) {
    const blocks = normalized
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
    if (blocks.length > 1) {
      return (
        <div className={className ? `space-y-3 ${className}` : "space-y-3"}>
          {blocks.map((block, i) => (
            <p key={i} className="whitespace-pre-line">
              {block}
            </p>
          ))}
        </div>
      );
    }
  }

  return <Tag className={`whitespace-pre-line ${className}`.trim()}>{normalized}</Tag>;
}

export function hasPlainText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function plainTextChildren(value: string): ReactNode {
  return value.replace(/\r\n/g, "\n");
}
