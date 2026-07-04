import type { ReactNode } from "react";
import { Form, useLoaderData } from "react-router";
import {
  THEME_MODES,
  THEME_MODE_LABELS,
  THEME_STYLES,
  THEME_STYLE_LABELS,
  type ThemeMode,
  type ThemeStyle,
} from "../../lib/theme/constants";
import { THEME_STYLE_PREVIEW } from "../../lib/theme/themePreviewColors";
import { PageHeader } from "../../components/accessories/Rail/Rail";
import { buildPageMeta } from "../../lib/seo";
import { cn } from "~/lib/utils";

export function meta() {
  return buildPageMeta({
    title: "Settings | Mohamed Amara",
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
  const theme: ThemeMode = THEME_MODES.includes(themeRaw as ThemeMode)
    ? (themeRaw as ThemeMode)
    : "system";
  const style: ThemeStyle = THEME_STYLES.includes(styleRaw as ThemeStyle)
    ? (styleRaw as ThemeStyle)
    : "default";
  return { theme, style };
};

function SettingsSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border/70 bg-background/80"
    >
      <summary className="cursor-pointer list-none px-4 py-3.5 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <span
            aria-hidden
            className="text-muted-foreground transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </div>
      </summary>
      <div className="border-t border-border/50 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        {children}
      </div>
    </details>
  );
}

function StyleSwatches({ styleKey }: { styleKey: ThemeStyle }) {
  const colors = THEME_STYLE_PREVIEW[styleKey];
  return (
    <span className="flex shrink-0 gap-0.5 overflow-hidden rounded-md border border-border/60">
      <span
        className="h-4 w-4"
        style={{ backgroundColor: colors.background }}
        aria-hidden
      />
      <span
        className="h-4 w-4"
        style={{ backgroundColor: colors.primary }}
        aria-hidden
      />
      <span
        className="h-4 w-4"
        style={{ backgroundColor: colors.chart }}
        aria-hidden
      />
    </span>
  );
}

export default function SettingsIndex() {
  const { theme, style } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-5 sm:py-16 md:px-6 md:py-20 xl:max-w-3xl">
      <PageHeader title="Settings" />

      <div className="space-y-4">
        <SettingsSection title="Theme (light / dark)">
          <p className="mb-3 text-xs text-muted-foreground">
            Current:{" "}
            <span className="font-medium text-foreground">
              {THEME_MODE_LABELS[theme]}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {THEME_MODES.map((mode) => (
              <Form key={mode} method="post" action="/set-theme" className="inline">
                <input type="hidden" name="theme" value={mode} />
                <button
                  type="submit"
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                    theme === mode
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {THEME_MODE_LABELS[mode]}
                </button>
              </Form>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Color palette (style)">
          <p className="mb-3 text-xs text-muted-foreground">
            Current:{" "}
            <span className="font-medium text-foreground">
              {THEME_STYLE_LABELS[style]}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {THEME_STYLES.map((s) => (
              <Form key={s} method="post" action="/set-theme" className="inline">
                <input type="hidden" name="style" value={s} />
                <button
                  type="submit"
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                    style === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  <StyleSwatches styleKey={s} />
                  {THEME_STYLE_LABELS[s]}
                </button>
              </Form>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Colors" defaultOpen={false}>
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
        </SettingsSection>
      </div>
    </main>
  );
}
