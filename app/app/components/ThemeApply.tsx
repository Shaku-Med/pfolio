import { useEffect } from "react";
import type { ThemeMode, ThemeStyle } from "../lib/theme/constants";
import { applyTheme } from "../lib/theme/apply";

interface ThemeApplyProps {
  theme: ThemeMode | null | undefined;
  style: ThemeStyle | null | undefined;
}

export function ThemeApply({ theme, style }: ThemeApplyProps) {
  useEffect(() => {
    applyTheme(theme, style);
  }, [theme, style]);

  return null;
}
