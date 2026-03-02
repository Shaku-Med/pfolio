import { Link } from "react-router";
import type { ExperienceEntry } from "../../lib/experience";
import ImgLoader from "~/lib/utils/Image/ImgLoader";

type ExperienceItemProps = {
  entry: ExperienceEntry;
  to?: string;
};

export default function ExperienceItem({ entry, to }: ExperienceItemProps) {
  const logoSrc = entry.logo
    ? entry.logo.startsWith("http")
      ? entry.logo
      : `/api/load/image${entry.logo}`
    : undefined;

  const content = (
    <div className="flex gap-4">
      {logoSrc && (
        <ImgLoader
          src={logoSrc}
          alt={entry.title}
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[0.938rem] font-semibold tracking-tight">
            {entry.title}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground/60">
            {entry.period}
          </span>
        </div>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {[entry.role, entry.company, entry.location]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {entry.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
            {entry.description}
          </p>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-xl py-4 px-2 transition-colors hover:bg-muted/30"
      >
        {content}
      </Link>
    );
  }

  return <article className="py-4">{content}</article>;
}