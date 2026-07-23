import {
  STYLE_COOKIE_NAME,
  THEME_COOKIE_NAME,
  type ThemeMode,
  type ThemeStyle,
} from "./constants";

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function cookieSecureSuffix(): string {
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${cookieSecureSuffix()}`;
}

/** Read theme from document.cookie (client). */
export function getThemeFromCookieClient(): ThemeMode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${THEME_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  return value === "system" || value === "light" || value === "dark"
    ? value
    : null;
}

/** Apply light/dark/system immediately (DOM + cookie). */
export function setTheme(mode: ThemeMode): void {
  writeCookie(THEME_COOKIE_NAME, mode);
  document.documentElement.classList.remove("system", "light", "dark");
  document.documentElement.classList.add(mode);
}

/** Swap color palette stylesheet immediately (DOM + cookie). */
export function setStyle(style: ThemeStyle): void {
  writeCookie(STYLE_COOKIE_NAME, style);
  const link = document.querySelector<HTMLLinkElement>("link[data-theme-palette]");
  if (link) {
    link.href = `/themes/${style}.css`;
  }
}

/** Persist theme/style via API (sets HttpOnly-less cookies server-side too). */
export async function persistThemePreference(input: {
  theme?: ThemeMode;
  style?: ThemeStyle;
}): Promise<boolean> {
  const body = new URLSearchParams();
  if (input.theme) body.set("theme", input.theme);
  if (input.style) body.set("style", input.style);
  if (![...body.keys()].length) return false;

  try {
    const res = await fetch("/set-theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
