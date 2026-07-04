import { useEffect, useState } from "react";

export function useStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const check = (): boolean => {
      if (typeof window === "undefined") return false;
      if (window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
      if (window.matchMedia("(display-mode: minimal-ui)").matches) return true;
      if ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true) return true;
      return false;
    };

    setIsStandalone(check());

    const mql = window.matchMedia("(display-mode: standalone)");
    const listener = () => setIsStandalone(check());
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return isStandalone;
}
