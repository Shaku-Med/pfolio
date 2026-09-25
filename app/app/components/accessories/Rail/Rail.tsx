import type { ReactNode } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** Shared in-view reveal so motion feels consistent site-wide. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px" }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Small rail fragment, the site's signature glyph, drawn in on view. */
export function RailGlyph({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 10"
      fill="none"
      className={cn("h-2.5 w-7 shrink-0", className)}
    >
      <path d="M1 5 C 8 3.5, 20 6.5, 27 5" stroke="var(--border)" strokeWidth="1.5" />
      {reduce ? (
        <path d="M1 5 C 8 3.5, 20 6.5, 27 5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <motion.path
          d="M1 5 C 8 3.5, 20 6.5, 27 5"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        />
      )}
      <circle cx="8" cy="4.6" r="2.4" fill="var(--background)" stroke="var(--muted-foreground)" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="20" cy="5.4" r="2.4" fill="var(--background)" stroke="var(--muted-foreground)" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  to?: string;
  linkLabel?: string;
};

export function SectionHeader({
  title,
  description,
  to,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="min-w-0 space-y-1.5">
        <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
          <RailGlyph />
          {title}
        </h2>
        {description && (
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {to && (
        <Link
          to={to}
          className="group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Reveal>
      <header className="mb-8 space-y-3 pt-4 sm:pt-6">
        <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          <RailGlyph className="h-3 w-8" />
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </header>
    </Reveal>
  );
}

type RailListProps = {
  items: string[];
};

/** Detail-page list rendered as stops on a small rail. */
export function RailList({ items }: RailListProps) {
  if (!items.length) return null;
  return (
    <ol className="relative mt-3">
      <span
        aria-hidden
        className="absolute bottom-3 left-[5px] top-3 w-px bg-border/70"
      />
      {items.map((item, i) => (
        <li key={i} className="relative pl-6 pb-3 last:pb-0">
          <span
            aria-hidden
            className="absolute left-0 top-[0.5rem] h-[11px] w-[11px] rounded-full border-2 border-muted-foreground/40 bg-background"
          />
          <Reveal delay={Math.min(i * 0.06, 0.3)}>
            <p className="text-[0.938rem] leading-[1.85] text-muted-foreground">{item}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

