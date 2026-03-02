import { Form, useLoaderData } from "react-router";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import {
  THEME_MODES,
  THEME_MODE_LABELS,
  THEME_STYLES,
  THEME_STYLE_LABELS,
  type ThemeMode,
  type ThemeStyle,
} from "../../lib/theme/constants";
import { buildPageMeta } from "../../lib/seo";

export function meta() {
  return buildPageMeta({
    title: "Settings – Mohamed Amara",
    description: "Theme and appearance settings.",
    canonicalPath: "/settings",
  });
}

const COLOR_VARS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

export const loader = async ({ request }: { request: Request }) => {
  const cookie = request.headers.get("Cookie") ?? "";
  const themeMatch = cookie.match(/theme=([^;]+)/);
  const styleMatch = cookie.match(/theme_style=([^;]+)/);
  const themeRaw = themeMatch?.[1]?.trim() ?? "system";
  const styleRaw = styleMatch?.[1]?.trim() ?? "default";
  const theme: ThemeMode = THEME_MODES.includes(themeRaw as ThemeMode) ? (themeRaw as ThemeMode) : "system";
  const style: ThemeStyle = THEME_STYLES.includes(styleRaw as ThemeStyle) ? (styleRaw as ThemeStyle) : "default";
  return { theme, style };
};

export default function SettingsIndex() {
  const { theme, style } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-2 sm:py-5 md:py-6 ">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Theme and color palette used across the app.
        </p>
      </header>

      <section className="mt-10 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Sun className="h-4 w-4 text-muted-foreground" />
          Theme (light / dark)
        </h2>
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-medium text-foreground">{THEME_MODE_LABELS[theme]}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {THEME_MODES.map((mode) => {
            const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
            return (
              <Form key={mode} method="post" action="/set-theme" className="inline">
                <input type="hidden" name="theme" value={mode} />
                <button
                  type="submit"
                  className={`
                    flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition
                    ${theme === mode
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {THEME_MODE_LABELS[mode]}
                </button>
              </Form>
            );
          })}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Color palette (style)
        </h2>
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-medium text-foreground">{THEME_STYLE_LABELS[style]}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {THEME_STYLES.map((s) => (
            <Form key={s} method="post" action="/set-theme" className="inline">
              <input type="hidden" name="style" value={s} />
              <button
                type="submit"
                className={`
                  flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition
                  ${style === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                  }
                `}
              >
                <Palette className="h-4 w-4 shrink-0" />
                {THEME_STYLE_LABELS[s]}
              </button>
            </Form>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Colors
        </h2>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {COLOR_VARS.map((name) => (
            <div
              key={name}
              className="aspect-square rounded-lg border border-border/70 shadow-sm"
              style={{ backgroundColor: `var(--${name})` }}
              title={name}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
