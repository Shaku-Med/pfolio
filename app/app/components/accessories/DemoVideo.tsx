import { useReducedMotion } from "motion/react";

type DemoVideoProps = {
  src: string;
  poster?: string;
  label: string;
};

// Plays like a moving screenshot. People who ask for reduced motion get a
// still poster with controls instead of autoplay.
export default function DemoVideo({ src, poster, label }: DemoVideoProps) {
  const reduce = useReducedMotion();
  return (
    <video
      key={reduce ? "still" : "auto"}
      src={src}
      poster={poster}
      aria-label={label}
      className="h-full w-full object-contain"
      autoPlay={!reduce}
      controls={Boolean(reduce)}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
