import type { ThemeStyle } from "../theme/constants";

/** Light-mode preview swatches per palette (from themes/*.css). */
export const THEME_STYLE_PREVIEW: Record<
  ThemeStyle,
  { primary: string; chart: string; background: string }
> = {
  default: {
    primary: "oklch(0.637 0.173 155.8)",
    chart: "oklch(0.871 0.15 154.449)",
    background: "oklch(1 0 0)",
  },
  amber: {
    primary: "oklch(0.72 0.19 75)",
    chart: "oklch(0.75 0.2 75)",
    background: "oklch(0.99 0.012 85)",
  },
  stone: {
    primary: "oklch(0.216 0.006 56.043)",
    chart: "oklch(0.646 0.222 41.116)",
    background: "oklch(1 0 0)",
  },
  slate: {
    primary: "oklch(0.45 0.06 255)",
    chart: "oklch(0.55 0.08 255)",
    background: "oklch(1 0 0)",
  },
  zinc: {
    primary: "oklch(0.28 0.01 275)",
    chart: "oklch(0.5 0.03 275)",
    background: "oklch(1 0 0)",
  },
  gray: {
    primary: "oklch(0.28 0.005 260)",
    chart: "oklch(0.45 0.02 260)",
    background: "oklch(1 0 0)",
  },
  rose: {
    primary: "oklch(0.55 0.2 350)",
    chart: "oklch(0.65 0.22 350)",
    background: "oklch(0.992 0.008 350)",
  },
  violet: {
    primary: "oklch(0.55 0.22 295)",
    chart: "oklch(0.65 0.24 295)",
    background: "oklch(0.99 0.01 295)",
  },
  indigo: {
    primary: "oklch(0.52 0.22 275)",
    chart: "oklch(0.62 0.24 275)",
    background: "oklch(0.99 0.01 275)",
  },
  sky: {
    primary: "oklch(0.55 0.2 245)",
    chart: "oklch(0.65 0.22 245)",
    background: "oklch(0.99 0.01 240)",
  },
  emerald: {
    primary: "oklch(0.55 0.18 155)",
    chart: "oklch(0.65 0.2 155)",
    background: "oklch(0.99 0.01 155)",
  },
  teal: {
    primary: "oklch(0.52 0.16 195)",
    chart: "oklch(0.62 0.18 195)",
    background: "oklch(0.99 0.01 195)",
  },
  natural: {
    primary: "oklch(0.205 0 0)",
    chart: "oklch(0.646 0.222 41.116)",
    background: "oklch(1 0 0)",
  },
  coral: {
    primary: "oklch(0.58 0.2 25)",
    chart: "oklch(0.65 0.22 25)",
    background: "oklch(0.992 0.01 25)",
  },
};
