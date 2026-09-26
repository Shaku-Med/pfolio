# Portfolio site

This folder is the public site at [medzy.brozy.org](https://medzy.brozy.org). It
reads everything from Supabase, so projects, posts and roles change from the
admin tool without a redeploy. Setup, Supabase, the image repo and deploys are
covered in the [root README](../README.md).

## Stack

React Router 8 in framework mode with server rendering, React 19, Tailwind CSS 4,
Vite 8 and TypeScript 7. Data comes from Supabase, images come from a GitHub
repo through a small proxy, and email goes out through Nodemailer.

## Scripts

Run these from this folder, or from the repo root with `npm run <script>`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build into `build/` |
| `npm start` | Serves the build, reading `.env` |
| `npm run typecheck` | Generates route types, then checks the whole app |
| `npm test` | Runs the Vitest suite once |

## Environment

Copy `.env.example` to `.env`. The site refuses to start in production without
`SUPABASE_URL` and `SUPABASE_ANON_KEY`, and it rejects a service role key, since
the public site should never bypass row level security.

| Variable | Used for |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Reading content |
| `GITHUB_OWNER`, `GITHUB_REPO` | The image and video proxy |
| `SITE_URL` | Canonical links, the sitemap, feeds and preview cards |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Sending contact form mail |
| `CONTACT_TO_EMAIL` | Where contact form messages land |

## Layout

```
app/
  routes.ts            every route in one place
  root.tsx             document shell, icons, security headers
  routes/              pages, plus data and resource routes
  components/          shared UI; accessories/ holds cards, the timeline, detail layout
  lib/
    database/          Supabase client, queries and the read cache
    security/          input cleaning, rate limits, URL and email checks
    og/                preview card rendering
    seo/               meta tags and structured data
public/                icons, fonts, themes and the resume PDF
test/                  Vitest suites
```

## Public endpoints

Besides the pages, the site serves a few files for search engines, feed readers
and AI tools. All of them are built from the same data as the pages.

| Path | What it is |
| --- | --- |
| `/sitemap.xml` | Every page and detail page, for search engines |
| `/robots.txt` | Crawl rules and the sitemap location |
| `/rss.xml` | Blog feed |
| `/llms.txt`, `/llms-full.txt` | Plain text summaries for AI assistants, following [llmstxt.org](https://llmstxt.org) |
| `/og/<kind>/<id>` | Generated 1200 by 630 link preview cards |
| `/healthz` | Liveness check for Docker. It never touches the database |

## How data flows

Loaders call the functions in `lib/database/queries.ts`. Public reads are cached
in memory for five minutes, so repeat visits and crawlers do not hit Supabase
every time. Admin edits can take up to five minutes to show up. Search and tag
lookups take user input, so they skip the cache and are rate limited instead.

Images and demo videos live in the GitHub repo named by `GITHUB_OWNER` and
`GITHUB_REPO`. `/api/load/image/<path>` validates the path, fetches the file and
serves it with long cache headers. Videos also answer range requests, which
Safari needs to play them.

## Security notes

Things worth knowing before you change something:

- The contact form checks the origin, rate limits by IP and caps every field.
- Client IPs come from `X-Real-IP` set by nginx, or the last `X-Forwarded-For`
  entry. Anything a client can set is ignored.
- Links stored in the database only render when they are plain http or https.
- Markdown from the database renders through a tag allow list in `lib/markdown.ts`,
  so script, iframe, style and form tags never reach the page.
- Preview cards for static pages use fixed text, so nobody can put their own
  words on an image served from this domain.

The tests in `test/` cover these helpers, and CI runs them before every deploy.

## Fonts

The preview cards use Inter, bundled in `public/fonts` under the SIL Open Font
License. The license is in `public/fonts/OFL.txt`.
