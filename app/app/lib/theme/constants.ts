export const THEME_COOKIE_NAME = "theme";
export const STYLE_COOKIE_NAME = "theme_style";

export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/** Color palette / style. Must match a file in app/lib/styles/themes/*.css */
export const THEME_STYLES = [
  "default",
  "amber",
  "stone",
  "slate",
  "zinc",
  "gray",
  "rose",
  "violet",
  "indigo",
  "sky",
  "emerald",
  "teal",
  "natural",
  "coral",
] as const;
export type ThemeStyle = (typeof THEME_STYLES)[number];

export const THEME_STYLE_LABELS: Record<ThemeStyle, string> = {
  default: "Default",
  amber: "Amber",
  stone: "Stone",
  slate: "Slate",
  zinc: "Zinc",
  gray: "Gray",
  rose: "Rose",
  violet: "Violet",
  indigo: "Indigo",
  sky: "Sky",
  emerald: "Emerald",
  teal: "Teal",
  natural: "Natural",
  coral: "Coral",
};

export function isValidThemeMode(v: unknown): v is ThemeMode {
  return typeof v === "string" && THEME_MODES.includes(v as ThemeMode);
}

export function isValidThemeStyle(v: unknown): v is ThemeStyle {
  return typeof v === "string" && THEME_STYLES.includes(v as ThemeStyle);
}

/** Read theme from Cookie header (server). */
export function getThemeFromCookie(headers: Headers): ThemeMode | null {
  const cookie = headers.get("Cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${THEME_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  return isValidThemeMode(value) ? value : null;
}

/** Read style from Cookie header (server). */
export function getStyleFromCookie(headers: Headers): ThemeStyle | null {
  const cookie = headers.get("Cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${STYLE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  return isValidThemeStyle(value) ? value : null;
}
