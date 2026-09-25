import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./lib/styles/app.css";
import {
  getThemeFromCookie,
  getStyleFromCookie,
  THEME_MODES,
  type ThemeMode,
  type ThemeStyle,
} from "./lib/theme/constants";
import { buildDefaultMeta, buildErrorMeta } from "./lib/seo";
import {
  APPLE_TOUCH_ICON_PATH,
  FAVICON_PATH,
  ICON_192_PATH,
  ICON_512_PATH,
  MANIFEST_PATH,
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
} from "./lib/seo/constants";
import NavProgress from "./lib/NavProgress";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: FAVICON_PATH, sizes: "32x32" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/web/favicon-16x16.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/web/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "48x48", href: "/web/favicon-48x48.png" },
  { rel: "icon", type: "image/png", sizes: "96x96", href: "/web/favicon-96x96.png" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: ICON_192_PATH },
  { rel: "icon", type: "image/png", sizes: "512x512", href: ICON_512_PATH },
  { rel: "apple-touch-icon", sizes: "180x180", href: APPLE_TOUCH_ICON_PATH },
  { rel: "manifest", href: MANIFEST_PATH },
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: "Mohamed Amara's blog",
    href: "/rss.xml",
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const headers: Route.HeadersFunction = () => ({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // A full script-src policy needs per-request nonces for React Router's inline
  // scripts; these directives are safe without them.
  "Content-Security-Policy":
    "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
});

export const meta: Route.MetaFunction = ({ error }) => {
  if (error) {
    return buildErrorMeta();
  }
  return buildDefaultMeta();
};

export const loader = async ({ request }: { request: Request }) => {
  const theme = getThemeFromCookie(request.headers) ?? ("system" as ThemeMode);
  const style = getStyleFromCookie(request.headers) ?? ("default" as ThemeStyle);
  const resolvedTheme = THEME_MODES.includes(theme) ? theme : "system";
  return data({ theme: resolvedTheme, style });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, style } = useLoaderData<typeof loader>();

  return (
    <html className={theme} lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content={THEME_COLOR_LIGHT} />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content={THEME_COLOR_DARK} />
        <link rel="stylesheet" href={`/themes/${style}.css`} data-theme-palette />
        <Meta />
        <Links />
      </head>
      <body>
        <NavProgress />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
