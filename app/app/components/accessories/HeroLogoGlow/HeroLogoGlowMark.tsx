import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { ICON_MARK_PATHS, ICON_MARK_VIEWBOX } from "~/lib/brand/iconMark";

const GLOW_LAYERS = [
  { strokeWidth: 2.75, blur: 5, opacity: 0.85, dash: 0.07, delay: 0 },
  { strokeWidth: 1.6, blur: 2.5, opacity: 0.45, dash: 0.045, delay: 0.38 },
  { strokeWidth: 1, blur: 1.2, opacity: 0.28, dash: 0.03, delay: 0.72 },
] as const;

const LOOP_SECONDS = 14;

type HeroLogoGlowMarkProps = {
  visible: boolean;
};

/** Heavy SVG mark — loaded only after the page is ready (separate chunk). */
const HeroLogoGlowMark = ({ visible }: HeroLogoGlowMarkProps) => {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [pathLengths, setPathLengths] = useState<number[]>(() =>
    ICON_MARK_PATHS.map(() => 1),
  );

  useEffect(() => {
    if (reduceMotion) return;
    const lengths = pathRefs.current.map((path) => path?.getTotalLength() ?? 1);
    if (lengths.some((length) => length > 1)) {
      setPathLengths(lengths);
    }
  }, [reduceMotion]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center px-2 transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative aspect-square h-auto w-[min(58vw,340px)] max-h-[340px] sm:w-[min(48vw,380px)] sm:max-h-[380px] md:w-[min(42vw,420px)] md:max-h-[420px]">
        <div className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--primary)_22%,transparent)_0%,color-mix(in_oklab,var(--primary)_8%,transparent)_38%,transparent_70%)] opacity-50 blur-xl dark:opacity-40" />
        <div
          className="relative h-full w-full"
          style={{
            maskImage:
              "radial-gradient(circle at center, #000 42%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, #000 42%, transparent 78%)",
          }}
        >
          <svg
            className="h-full w-full text-primary/10"
            viewBox={ICON_MARK_VIEWBOX}
            preserveAspectRatio="xMidYMid meet"
            fill="none"
          >
            <defs>
              <linearGradient
                id={`${uid}-stroke`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="color-mix(in oklab, var(--primary) 55%, var(--background))"
                  stopOpacity="0.15"
                />
                <stop offset="40%" stopColor="var(--primary)" stopOpacity="0.95" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--primary) 65%, white)"
                  stopOpacity="0.85"
                />
              </linearGradient>
              <radialGradient id={`${uid}-wash`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
                <stop offset="70%" stopColor="var(--primary)" stopOpacity="0.04" />
                <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
              </radialGradient>
              {GLOW_LAYERS.map((layer, index) => (
                <filter
                  key={index}
                  id={`${uid}-glow-${index}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation={layer.blur} result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <rect x="0" y="0" width="512" height="512" fill={`url(#${uid}-wash)`} />

            <g>
              {ICON_MARK_PATHS.map((d, index) => (
                <path
                  key={`base-${index}`}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-[0.22] dark:opacity-[0.14]"
                />
              ))}

              {ICON_MARK_PATHS.map((d, pathIndex) => {
                const pathLength = pathLengths[pathIndex] ?? 1;
                const pathDelay = pathIndex * 0.55;

                if (reduceMotion) {
                  return (
                    <path
                      key={`static-${pathIndex}`}
                      ref={(el) => {
                        pathRefs.current[pathIndex] = el;
                      }}
                      d={d}
                      fill="none"
                      stroke={`url(#${uid}-stroke)`}
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      opacity={0.35}
                    />
                  );
                }

                return GLOW_LAYERS.map((layer, layerIndex) => {
                  const dash = pathLength * layer.dash;
                  const gap = Math.max(pathLength - dash, 1);

                  return (
                    <motion.path
                      key={`glow-${pathIndex}-${layerIndex}`}
                      ref={
                        layerIndex === 0
                          ? (el) => {
                              pathRefs.current[pathIndex] = el;
                            }
                          : undefined
                      }
                      d={d}
                      fill="none"
                      stroke={`url(#${uid}-stroke)`}
                      strokeWidth={layer.strokeWidth}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      filter={`url(#${uid}-glow-${layerIndex})`}
                      opacity={layer.opacity}
                      strokeDasharray={`${dash} ${gap}`}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -pathLength }}
                      transition={{
                        duration: LOOP_SECONDS,
                        delay: pathDelay + layer.delay * LOOP_SECONDS,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  );
                });
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroLogoGlowMark;
