import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../Rail/Rail";
import { TextBlock } from "../TextBlock";
import { TechTag } from "~/lib/tech/TechTag";
import { cn } from "~/lib/utils";

export const PROSE_CLASS =
  "prose prose-neutral max-w-none text-[0.938rem] dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.85] prose-a:text-primary prose-a:underline-offset-4 prose-img:rounded-xl prose-pre:border prose-pre:border-border/40 prose-pre:bg-muted prose-code:text-[0.875em]";

type MoreLink = { to: string; label: string };

export function DetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-5 sm:pt-8 md:px-6">
      <article>{children}</article>
    </main>
  );
}

type DetailHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  lede?: string;
};

export function DetailHeader({ eyebrow, title, lede }: DetailHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow && (
        <Reveal>
          <p className="text-sm text-muted-foreground">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tighter sm:text-5xl">
          {title}
        </h1>
      </Reveal>
      {lede && (
        <Reveal delay={0.1}>
          <TextBlock
            text={lede}
            paragraphs
            className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground"
          />
        </Reveal>
      )}
    </header>
  );
}

export function DetailCover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal delay={0.12}>
      <div
        className={cn(
          "relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted sm:aspect-[21/9]",
          className,
        )}
      >
        {children}
      </div>
    </Reveal>
  );
}

export function DetailBody({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">{children}</div>
      {aside && (
        <aside>
          <div className="space-y-6 lg:sticky lg:top-28">{aside}</div>
        </aside>
      )}
    </div>
  );
}

export function SideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border/60 pt-4">
      <h2 className="mb-2.5 text-xs text-muted-foreground">{title}</h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  const clean = tags.filter((tag) => tag != null && String(tag).trim() !== "");
  if (!clean.length) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {clean.map((tag) => (
        <Link
          key={tag}
          to={`/tags/${encodeURIComponent(tag)}`}
          className="hover:[&>span]:text-foreground"
        >
          <TechTag name={tag} />
        </Link>
      ))}
    </div>
  );
}

type SideLinkProps = {
  href: string;
  label: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
};

export function SideLink({ href, label, hint, icon: Icon }: SideLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

export function DetailNotFound({ what, more }: { what: string; more: MoreLink }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-start justify-center gap-4 px-4 sm:px-5 md:px-6">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        I couldn't find that {what}.
      </h1>
      <p className="max-w-md text-muted-foreground">
        It may have been moved or taken down. The rest is still here, though.
      </p>
      <Link
        to={more.to}
        className="mt-2 text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
      >
        {more.label}
      </Link>
    </main>
  );
}
