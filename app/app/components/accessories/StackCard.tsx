import { Link } from "react-router";
import { parseToolsString, type StackCategory } from "../../lib/stack";
import { TechTag } from "~/lib/tech/TechTag";
import { TextBlock } from "./TextBlock";

type StackCardProps = {
  item: StackCategory;
  to?: string;
};

export default function StackCard({ item, to }: StackCardProps) {
  const tools = parseToolsString(item.tools);
  return (
    <Link
      to={to ?? `/stack/${item.id}`}
      className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-border/70 bg-card/60 p-5 transition duration-300 hover:border-border hover:bg-card"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-semibold tracking-tight">
          {item.category}
        </p>
        {tools.length > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {tools.length} {tools.length === 1 ? "tool" : "tools"}
          </span>
        )}
      </div>
      {item.description && (
        <TextBlock
          text={item.description}
          className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
        />
      )}
      <div className="mt-auto flex min-w-0 flex-wrap gap-x-4 gap-y-2 pt-5">
        {tools.map((tool) => (
          <TechTag key={tool} name={tool} />
        ))}
      </div>
    </Link>
  );
}
