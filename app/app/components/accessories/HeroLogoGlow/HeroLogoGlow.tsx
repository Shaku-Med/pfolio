import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { ICON_MARK_PATHS, ICON_MARK_VIEWBOX } from "~/lib/brand/iconMark";

const GLOW_LAYERS = [
  { strokeWidth: 3.5, blur: 6, opacity: 0.95, dash: 0.07, delay: 0 },
  { strokeWidth: 2, blur: 3, opacity: 0.55, dash: 0.045, delay: 0.38 },
  { strokeWidth: 1.25, blur: 1.5, opacity: 0.35, dash: 0.03, delay: 0.72 },
] as const;

const LOOP_SECONDS = 14;

type HeroLogoGlowProps = {
  className?: string;
};

const HeroLogoGlow = ({ className = "" }: HeroLogoGlowProps) => {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [pathLengths, setPathLengths] = useState<number[]>(() =>
    ICON_MARK_PATHS.map(() => 1),
  );

  useEffect(() => {
    const lengths = pathRefs.current.map((path) => path?.getTotalLength() ?? 1);
    if (lengths.some((length) => length > 1)) {
      setPathLengths(lengths);
    }
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center px-2">
        <div className="relative aspect-square h-full w-auto max-h-[720px] max-w-[min(92vw,720px)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_72%)] opacity-[0.09]" />
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
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="45%" stopColor="var(--primary)" stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--primary) 70%, white)"
                  stopOpacity="1"
                />
              </linearGradient>
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

            <g>
              {ICON_MARK_PATHS.map((d, index) => (
                <path
                  key={`base-${index}`}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-[0.28] dark:opacity-[0.18]"
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
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      opacity={0.4}
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

export default HeroLogoGlow;
