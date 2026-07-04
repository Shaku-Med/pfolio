import { Link } from "react-router";
import { parseToolsString, type StackCategory } from "../../lib/stack";
import { TechTag } from "~/lib/tech/TechTag";

type StackCardProps = {
  item: StackCategory;
  to?: string;
};

export default function StackCard({ item, to }: StackCardProps) {
  const tools = parseToolsString(item.tools);
  return (
    <Link
      to={to ?? `/stack/${item.id}`}
      className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5 transition hover:border-primary/50 hover:bg-muted/30"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
          {item.category}
        </p>
        {tools.length > 0 && (
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/60">
            {tools.length} {tools.length === 1 ? "tool" : "tools"}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}
      <div className="mt-auto flex min-w-0 flex-wrap gap-1.5 pt-3">
        {tools.map((tool) => (
          <TechTag key={tool} name={tool} />
        ))}
      </div>
    </Link>
  );
}
