import { Link, useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { getExperienceById } from "../../../lib/database/queries";
import type { ExperienceEntry } from "../../../lib/experience";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "~/lib/tech/TechTag";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { useState } from "react";
import { BASE_URL, buildPageMeta } from "~/lib/seo";

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getExperienceById(id);
  if (!entry) return null;
  return { entry };
}

export function meta({ data }: { data: { entry: ExperienceEntry } | null }) {
  if (!data?.entry) {
    return buildPageMeta({
      title: "Not found – Mohamed Amara",
      description: "Experience not found.",
      noindex: true,
    });
  }
  const entry = data.entry;
  const ogImage = entry.logo
    ? entry.logo.startsWith("http")
      ? entry.logo
      : `${BASE_URL}/api/load/image${entry.logo}`
    : undefined;
  return buildPageMeta({
    title: `${entry.title ?? entry.role ?? entry.company} – Mohamed Amara`,
    description: entry.description ?? undefined,
    canonicalPath: `/experience/${entry.id}`,
    ogImage,
    ogImageAlt: entry.company ?? entry.title ?? undefined,
  });
}

const ExperienceIdIndex = () => {
  const data = useLoaderData<typeof loader>();
  const entry = data?.entry as ExperienceEntry | undefined;

  const [imgColors, setImgColors] = useState<string[]>([]);

  if (!entry) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
        <p className="text-lg text-muted-foreground">Experience not found.</p>
      </main>
    );
  }

  const hasDetails =
    !!entry.detailsMd ||
    (entry.highlights && entry.highlights.length > 0) ||
    (entry.challenges && entry.challenges.length > 0) ||
    (entry.learnings && entry.learnings.length > 0) ||
    entry.developmentSummary;

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <article>
        {/* ────────────────────────────────────────────
            HERO — company banner with logo overlay
        ──────────────────────────────────────────── */}
        <div className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-3xl">
          <div className="aspect-[21/9] w-full bg-muted">
            <CanvasGradient colors={imgColors} />
            {entry.logo && (
              <ImgLoader
                src={
                  entry.logo.startsWith("http")
                    ? entry.logo
                    : `/api/load/image${entry.logo}`
                }
                alt={entry.company ? `${entry.company}` : "Company"}
                loading="lazy"
                className="h-full w-full"
                imageClassName="object-contain"
                shouldShowPreview={true}
              />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {entry.role}
            </span>
          </div>
        </div>

        {/* ────────────────────────────────────────────
            SIDE-BY-SIDE — content + sticky sidebar
        ──────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[1fr_17rem]">
          {/* ── Left column: main content ── */}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.65rem]">
              {entry.title}
            </h1>

            {entry.description && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {entry.description}
              </p>
            )}

            {entry.detailsMd && (
              <section className="mt-8">
                <MarkdownBody
                  content={entry.detailsMd}
                  className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.85] prose-a:text-primary prose-a:underline-offset-4 prose-img:rounded-xl prose-pre:bg-muted prose-pre:border prose-pre:border-border/40"
                />
              </section>
            )}

            {hasDetails && <hr className="my-8 border-border/50" />}

            {/* Development summary */}
            {entry.developmentSummary && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                  Development
                </h2>
                <p className="mt-3 text-[0.938rem] leading-[1.85] text-muted-foreground">
                  {entry.developmentSummary}
                </p>
              </section>
            )}

            {/* Highlights */}
            {entry.highlights && entry.highlights.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                  Key highlights
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {entry.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[0.938rem] leading-[1.85] text-muted-foreground"
                    >
                      <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Challenges */}
            {entry.challenges && entry.challenges.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                  Challenges
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {entry.challenges.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[0.938rem] leading-[1.85] text-muted-foreground"
                    >
                      <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Learnings */}
            {entry.learnings && entry.learnings.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                  Learnings
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {entry.learnings.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[0.938rem] leading-[1.85] text-muted-foreground"
                    >
                      <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ── Right column: sticky sidebar ── */}
          <aside className="lg:pt-1">
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Company info */}
              {entry.company && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Company
                  </h3>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                    {entry.logo && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background">
                        <ImgLoader
                          src={
                            entry.logo.startsWith("http")
                              ? entry.logo
                              : `/api/load/image${entry.logo}`
                          }
                          alt={entry.company}
                          loading="lazy"
                          className="h-full w-full"
                          imageClassName="object-cover"
                          shouldShowPreview={true}
                          getImgColors={true}
                          onGetImgColorsCallback={(colors) => {
                            setImgColors(colors);
                          }}
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {entry.company}
                    </span>
                  </div>
                </div>
              )}

              {/* Period */}
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  Period
                </h3>
                <p className="text-sm text-muted-foreground">{entry.period}</p>
              </div>

              {/* Location */}
              {entry.location && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Location
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {entry.location}
                  </p>
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Stack
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <Link to={`/tags/${encodeURIComponent(tag)}`} key={tag}>
                          <TechTag name={tag} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
};

export default ExperienceIdIndex;