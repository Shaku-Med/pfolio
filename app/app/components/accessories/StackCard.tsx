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
      className="block min-w-0 w-full h-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 transition hover:border-primary/50 hover:bg-muted/30"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
        {item.category}
      </p>
      <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
        {tools.map((tool) => (
          <TechTag key={tool} name={tool} />
        ))}
      </div>
    </Link>
  );
}
