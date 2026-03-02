import { THEME_COOKIE_NAME } from "./constants";
import type { ThemeMode } from "./constants";
import { isValidThemeMode } from "./constants";

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/** Read theme from document.cookie (client). */
export function getThemeFromCookieClient(): ThemeMode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${THEME_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  return isValidThemeMode(value) ? value : null;
}

/** Set theme cookie and update document.documentElement class. */
export function setTheme(mode: ThemeMode): void {
  document.cookie = `${THEME_COOKIE_NAME}=${mode}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.documentElement.classList.remove("system", "light", "dark");
  document.documentElement.classList.add(mode);
}
