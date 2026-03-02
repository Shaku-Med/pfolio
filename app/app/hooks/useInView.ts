import { useEffect, useRef, useState } from "react";

const defaultOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: "100px",
  threshold: 0,
};

export function useInView(options: Partial<IntersectionObserverInit> = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const opts = { ...defaultOptions, ...options };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry?.isIntersecting ?? false);
    }, opts);

    observer.observe(el);
    return () => observer.disconnect();
  }, [opts.root, opts.rootMargin, opts.threshold]);

  return { ref, inView };
}
