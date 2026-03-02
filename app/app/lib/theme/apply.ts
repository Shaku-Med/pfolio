import type { ThemeMode, ThemeStyle } from "./constants";

/** Dynamic imports for theme palette CSS (same names as THEME_STYLES). */
const STYLE_IMPORTS: Record<ThemeStyle, () => Promise<unknown>> = {
  default: () => import("../styles/themes/default.css"),
  amber: () => import("../styles/themes/amber.css"),
  stone: () => import("../styles/themes/stone.css"),
  slate: () => import("../styles/themes/slate.css"),
  zinc: () => import("../styles/themes/zinc.css"),
  gray: () => import("../styles/themes/gray.css"),
  rose: () => import("../styles/themes/rose.css"),
  violet: () => import("../styles/themes/violet.css"),
  indigo: () => import("../styles/themes/indigo.css"),
  sky: () => import("../styles/themes/sky.css"),
  emerald: () => import("../styles/themes/emerald.css"),
  teal: () => import("../styles/themes/teal.css"),
  natural: () => import("../styles/themes/natural.css"),
  coral: () => import("../styles/themes/coral.css"),
};

export function applyTheme(theme: ThemeMode | null | undefined, style: ThemeStyle | null | undefined) {
  const mode = theme ?? "system";
  const styleKey = style ?? "default";
  document.documentElement.classList.remove("system", "light", "dark");
  document.documentElement.classList.add(mode);
  const load = STYLE_IMPORTS[styleKey];
  if (load) load().catch(() => {});
}
