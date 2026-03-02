import { ExternalLink, FileText, Github, Globe, Video } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import MarkdownBody from "~/components/accessories/MarkdownBody";
import { getProjectById } from "~/lib/database/queries";
import type { Project, ProjectLink } from "~/lib/projects";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "~/lib/tech/TechTag";
import { useState } from "react";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { BASE_URL, buildPageMeta } from "~/lib/seo";

const linkIcons: Record<NonNullable<ProjectLink["icon"]>, typeof FileText> = {
  doc: FileText,
  video: Video,
  external: ExternalLink,
  article: FileText,
};

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return null;
  return { project };
}

export function meta({ data }: { data: { project: Project } | null }) {
  if (!data?.project) {
    return buildPageMeta({
      title: "Not found – Mohamed Amara",
      description: "Project not found.",
      noindex: true,
    });
  }
  const project = data.project;
  const ogImage = project.image
    ? project.image.startsWith("http")
      ? project.image
      : `${BASE_URL}/api/load/image${project.image}`
    : undefined;
  return buildPageMeta({
    title: `${project.title} – Mohamed Amara`,
    description: project.description,
    canonicalPath: `/projects/${project.id}`,
    ogImage,
    ogImageAlt: project.title,
  });
}

export default function ProjectIdIndex() {
  const data = useLoaderData<typeof loader>();
  if (!data?.project) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-lg text-muted-foreground">Project not found.</p>
      </main>
    );
  }

  const project = data.project as Project;
  const tags = project.tags.filter(
    (tag) => tag != null && String(tag).trim() !== ""
  );

  const [imgColors, setImgColors] = useState<string[]>([]);

  const hasLinks =
    project.githubUrl || project.liveUrl || (project.links?.length ?? 0) > 0;

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <article>
        {/* ────────────────────────────────────────────
            HERO — cinematic ultra-wide with scrim
        ──────────────────────────────────────────── */}
        <div className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-3xl">
          <div className="aspect-[21/9] w-full bg-muted"
          >
            <CanvasGradient colors={imgColors} />
            <ImgLoader
              src={`/api/load/image${project.image}`}
              alt={project.imageAlt}
              loading="lazy"
              className="h-full w-full"
              imageClassName="object-contain"
              shouldShowPreview={true}
              getImgColors={true}
              onGetImgColorsCallback={(colors) => {
                setImgColors(colors);
              }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {project.category}
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
              {project.title}
            </h1>

            {project.description && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}

            <hr className="my-8 border-border/50" />

            {project.detailsMd && (
              <section className="max-w-none text-[0.938rem]">
                <MarkdownBody
                  content={project.detailsMd}
                  className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.85] prose-a:text-primary prose-a:underline-offset-4 prose-img:rounded-xl prose-pre:bg-muted prose-pre:border prose-pre:border-border/40"
                />
              </section>
            )}
          </div>

          {/* ── Right column: sticky sidebar ── */}
          <aside className="lg:pt-1">
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Stack
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                      <Link to={`/tags/${encodeURIComponent(tag)}`} key={tag}>
                          <TechTag name={tag} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {hasLinks && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Links
                  </h3>
                  <div className="flex flex-col gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            Live site
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {project.liveUrl.replace(/^https?:\/\//, "")}
                          </span>
                        </div>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60"
                      >
                        <Github className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            Source code
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {project.githubUrl.replace(
                              /^https?:\/\/(www\.)?github\.com\//,
                              ""
                            )}
                          </span>
                        </div>
                      </a>
                    )}
                    {project.links?.map((link) => {
                      const Icon = link.icon ? linkIcons[link.icon] : FileText;
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {link.label}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}