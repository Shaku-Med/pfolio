import { redirect } from "react-router";
import {
  THEME_COOKIE_NAME,
  THEME_MODES,
  STYLE_COOKIE_NAME,
  THEME_STYLES,
  type ThemeMode,
  type ThemeStyle,
} from "../lib/theme/constants";

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function isValidThemeMode(v: unknown): v is ThemeMode {
  return typeof v === "string" && THEME_MODES.includes(v as ThemeMode);
}

function isValidThemeStyle(v: unknown): v is ThemeStyle {
  return typeof v === "string" && THEME_STYLES.includes(v as ThemeStyle);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") return redirect("/");
  const formData = await request.formData();
  const themeRaw = formData.get("theme");
  const styleRaw = formData.get("style");
  const theme = isValidThemeMode(themeRaw) ? themeRaw : null;
  const style = isValidThemeStyle(styleRaw) ? styleRaw : null;

  let redirectTo = "/";
  try {
    const referer = request.headers.get("Referer");
    if (referer) {
      const refUrl = new URL(referer);
      const baseUrl = new URL(request.url);
      if (refUrl.origin === baseUrl.origin) redirectTo = refUrl.pathname + refUrl.search;
    }
  } catch {
    // use "/"
  }

  const cookies: string[] = [];
  if (theme) {
    cookies.push(`${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`);
  }
  if (style) {
    cookies.push(`${STYLE_COOKIE_NAME}=${style}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`);
  }

  const headers = new Headers();
  cookies.forEach((c) => headers.append("Set-Cookie", c));

  return redirect(redirectTo, cookies.length ? { headers } : undefined);
}

export default function ApiSetTheme() {
  return null;
}
