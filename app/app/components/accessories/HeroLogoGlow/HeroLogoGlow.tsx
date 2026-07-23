import { lazy, Suspense, useEffect, useState } from "react";

const HeroLogoGlowMark = lazy(() => import("./HeroLogoGlowMark"));

type HeroLogoGlowProps = {
  className?: string;
};

/**
 * Soft ambient glow mounts immediately (tiny DOM, safe to SSR).
 * The heavy SVG mark animator is code-split and only mounts after
 * the page has loaded, so path data never lands in the initial HTML.
 */
const HeroLogoGlow = ({ className = "" }: HeroLogoGlowProps) => {
  const [markReady, setMarkReady] = useState(false);
  const [markVisible, setMarkVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const mountMark = () => {
      if (cancelled) return;
      setMarkReady(true);
      requestAnimationFrame(() => {
        if (!cancelled) setMarkVisible(true);
      });
    };

    const schedule = () => {
      if (cancelled || started) return;
      started = true;
      // Detect via a boolean local: `"requestIdleCallback" in window` used inline
      // negatively narrows window to `never` in the else (rIC is a declared member),
      // which would break window.setTimeout below.
      const canIdle =
        typeof window !== "undefined" && "requestIdleCallback" in window;
      if (canIdle) {
        idleId = window.requestIdleCallback(mountMark, { timeout: 1400 });
      } else {
        timeoutId = window.setTimeout(mountMark, 280);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
      // SPA / soft nav fallback if "load" already fired
      timeoutId = window.setTimeout(schedule, 900);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Ambient glow — blends into page background, no SVG paths */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-[42%] h-[min(52vw,420px)] w-[min(70vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_28%,transparent)_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_42%,transparent_72%)] opacity-70 blur-2xl dark:opacity-55" />
        <div className="absolute left-[58%] top-[38%] h-[min(36vw,280px)] w-[min(36vw,280px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--primary)_18%,var(--background))_0%,transparent_68%)] opacity-80 blur-3xl dark:opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,transparent_0%,var(--background)_78%)] opacity-90" />
      </div>

      {markReady ? (
        <Suspense fallback={null}>
          <HeroLogoGlowMark visible={markVisible} />
        </Suspense>
      ) : null}
    </div>
  );
};

export default HeroLogoGlow;
