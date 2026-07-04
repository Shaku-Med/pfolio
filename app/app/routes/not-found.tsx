import { Link, data } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { buildPageMeta } from "../lib/seo";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const RAIL_D = "M2 40 C 50 36, 110 44, 196 40";

export function loader() {
  return data(null, { status: 404 });
}

export function meta() {
  return buildPageMeta({
    title: "Not found | Mohamed Amara",
    description: "This page doesn't exist.",
    noindex: true,
  });
}

const NotFound = () => {
  const reduce = useReducedMotion();

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 py-16 text-center">
      <svg viewBox="0 0 260 80" fill="none" aria-hidden className="w-64 max-w-full">
        {[24, 60, 96, 132, 168].map((x) => (
          <path
            key={x}
            d={`M${x} 33 L${x} 47`}
            stroke="var(--border)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        <path d={RAIL_D} stroke="var(--border)" strokeWidth="1.5" />
        {reduce ? (
          <path d={RAIL_D} stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <motion.path
            d={RAIL_D}
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          />
        )}
        <circle
          cx="196"
          cy="40"
          r="4"
          fill="var(--background)"
          stroke="var(--muted-foreground)"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
        {/* Buffer stop — the track ends here. */}
        <motion.g
          initial={reduce ? false : { opacity: 0, x: -6 }}
          animate={reduce ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1.2, ease: EASE }}
        >
          <path d="M216 26 V54" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
          <path d="M206 40 H214" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
        </motion.g>
      </svg>

      <h1 className="mt-8 text-5xl font-semibold tracking-tight">404</h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        End of the line. This page doesn't exist, or it left the station.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Back home
        </Link>
        <Link
          to="/projects"
          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          See projects
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
