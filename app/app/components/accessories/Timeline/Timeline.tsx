import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { cn } from "~/lib/utils";
import type { ExperienceEntry } from "~/lib/experience";
import type { Project } from "~/lib/projects";
import { TextBlock } from "../TextBlock";

export type TimelineItem = {
  kind: "experience" | "project";
  id: string;
  href: string;
  title: string;
  meta: string;
  period: string;
  /** Rail marker ("2023", "Now"). Null items get no marker. */
  markerLabel: string | null;
  /** Ascending manual order from admin (lower = earlier). */
  position: number;
  description?: string;
  image?: string;
};

const RAIL_W = 44;
const SPINE_X = RAIL_W / 2;
/** Distance from an entry row's top to its node center, aligned with the title line. */
const NODE_Y = 26;
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

function resolveImage(src?: string): string | undefined {
  if (!src) return undefined;
  return src.startsWith("http") ? src : `/api/load/image${src}`;
}

function startYear(period: string): number | null {
  const m = period.match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

function formatProjectPeriod(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function experienceToTimeline(entries: ExperienceEntry[]): TimelineItem[] {
  return entries.map((entry, index) => {
    const ongoing = /now|present|since/i.test(entry.period);
    const year = startYear(entry.period);
    return {
      kind: "experience" as const,
      id: entry.id,
      href: `/experience/${entry.id}`,
      title: entry.title,
      meta: [entry.role, entry.company, entry.location].filter(Boolean).join(" · "),
      period: entry.period,
      markerLabel: ongoing ? "Now" : year ? String(year) : null,
      position: typeof entry.position === "number" ? entry.position : index,
      description: entry.description,
      image: resolveImage(entry.logo),
    };
  });
}

export function projectsToTimeline(projects: Project[]): TimelineItem[] {
  return projects
    .filter((p): p is Project & { date: string } => Boolean(p.date))
    .map((p, index) => {
      const d = new Date(p.date);
      const valid = !Number.isNaN(d.getTime());
      const year = valid ? d.getFullYear() : null;
      return {
        kind: "project" as const,
        id: p.id,
        href: `/projects/${p.id}`,
        title: p.title,
        meta: p.category,
        period: formatProjectPeriod(p.date),
        markerLabel: year ? String(year) : null,
        position: typeof p.position === "number" ? p.position : index,
        description: p.description,
        image: resolveImage(p.image),
      };
    });
}

/** Order by admin position (stable). Experience wins ties over projects. */
export function sortTimeline(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    if (a.kind === b.kind) return 0;
    return a.kind === "experience" ? -1 : 1;
  });
}

/** Gentle S-curves between nodes so the spine reads drawn, not ruled. */
function buildSpine(points: number[]): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  let d = `M ${SPINE_X} ${Math.max(0, first - 14)} L ${SPINE_X} ${first}`;
  for (let i = 1; i < points.length; i++) {
    const y0 = points[i - 1];
    const y1 = points[i];
    const gap = y1 - y0;
    const bend = (i % 2 === 0 ? 1 : -1) * Math.min(5, gap * 0.05 + 1.5);
    d += ` C ${SPINE_X + bend} ${y0 + gap * 0.35}, ${SPINE_X + bend} ${y1 - gap * 0.35}, ${SPINE_X} ${y1}`;
  }
  d += ` L ${SPINE_X} ${last + 14}`;
  return d;
}

type Row =
  | { type: "marker"; label: string; key: string }
  | { type: "entry"; item: TimelineItem };

function buildRows(items: TimelineItem[]): Row[] {
  const rows: Row[] = [];
  let lastLabel: string | null = null;
  for (const item of items) {
    if (item.markerLabel && item.markerLabel !== lastLabel) {
      rows.push({ type: "marker", label: item.markerLabel, key: `marker-${item.markerLabel}` });
      lastLabel = item.markerLabel;
    }
    rows.push({ type: "entry", item });
  }
  return rows;
}

function TimelineCard({ item }: { item: TimelineItem }) {
  return (
    <div className="flex gap-4">
      {item.kind === "experience" && item.image && (
        <ImgLoader
          src={item.image}
          alt={item.title}
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          {/* min-w-0 lets a long title wrap instead of forcing the row wider than
              the grid track; break-words handles unbroken strings (urls, slugs). */}
          <h3 className="min-w-0 break-words text-[0.938rem] font-semibold tracking-tight">
            {item.title}
          </h3>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground/60">
            {item.period}
          </span>
        </div>
        <p className="mt-0.5 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          {item.kind === "project" && (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Project
            </span>
          )}
          {/* truncate only ellipses if the flex item may shrink below content width */}
          <span className="min-w-0 truncate">{item.meta}</span>
        </p>
        {item.description && (
          <TextBlock
            text={item.description}
            className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80"
          />
        )}
      </div>
      {item.kind === "project" && item.image && (
        <ImgLoader
          src={item.image}
          alt={item.title}
          className="hidden h-14 w-24 shrink-0 rounded-lg border border-border/60 object-cover sm:block"
          loading="lazy"
        />
      )}
    </div>
  );
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState<{ height: number; points: number[] } | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.45"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const nodeRows = Array.from(
        container.querySelectorAll<HTMLElement>("[data-node-row]"),
      );
      if (!nodeRows.length) {
        setGeom(null);
        return;
      }
      setGeom({
        height: container.offsetHeight,
        points: nodeRows.map((row) => row.offsetTop + NODE_Y),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveKey(entry.target.getAttribute("data-key"));
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    container
      .querySelectorAll("[data-node-row]")
      .forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;

  const rows = buildRows(items);
  const spine = geom ? buildSpine(geom.points) : "";

  return (
    <div ref={containerRef} className="relative">
      {geom && geom.points.length > 0 ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 w-[2.75rem]"
          style={{ height: geom.height }}
          viewBox={`0 0 ${RAIL_W} ${geom.height}`}
          fill="none"
          preserveAspectRatio="none"
        >
          <path d={spine} stroke="var(--border)" strokeWidth="1.5" />
          {reduceMotion ? (
            <path d={spine} stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <motion.path
              d={spine}
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          )}
        </svg>
      ) : (
        <span
          aria-hidden
          className="absolute bottom-6 left-[21px] top-3 w-px bg-border/60"
        />
      )}

      <ol>
        {rows.map((row) => {
          if (row.type === "marker") {
            return (
              <li key={row.key} className="grid h-10 grid-cols-[2.75rem_minmax(0,1fr)]">
                <div className="relative">
                  <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-1 py-0.5 text-[10px] font-medium tabular-nums tracking-wide text-muted-foreground/70">
                    {row.label}
                  </span>
                </div>
                <div />
              </li>
            );
          }

          const { item } = row;
          const key = `${item.kind}-${item.id}`;
          const active = activeKey === key;
          return (
            <li
              key={key}
              data-node-row
              data-key={key}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)]"
            >
              <div className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-1/2 top-[26px] z-10 -translate-x-1/2 -translate-y-1/2 border-2 border-muted-foreground/40 bg-background transition-[box-shadow,transform] duration-300",
                    item.kind === "experience"
                      ? "h-3 w-3 rounded-full"
                      : "h-2.5 w-2.5 rotate-45 rounded-[2px]",
                    active && "scale-110 shadow-[0_0_0_5px_var(--muted)]",
                  )}
                />
              </div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px 0px" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-4 transition-colors hover:bg-muted/40",
                    active && "bg-muted/40",
                  )}
                >
                  <TimelineCard item={item} />
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
