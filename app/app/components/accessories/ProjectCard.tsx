import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Globe,
  type LucideIcon,
  Video,
} from "lucide-react";
import { Link } from "react-router";
import type { Project, ProjectLink } from "../../lib/projects";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "../../lib/tech/TechTag";
import { TextBlock } from "./TextBlock";
import { Github } from "../ui/brand-icons";
import { cn } from "~/lib/utils";

const linkIcons: Record<NonNullable<ProjectLink["icon"]>, LucideIcon> = {
  doc: FileText,
  video: Video,
  external: ExternalLink,
  article: FileText,
};

const MAX_TAGS = 3;
const actionClassName =
  "relative z-10 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.6875rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

type ProjectCardProps = {
  project: Project;
  to?: string;
  descriptionClamp?: boolean;
  featured?: boolean;
};

// The title link stretches over the card, so tags and outbound links can sit
// on top as real links without nesting anchors.
export default function ProjectCard({
  project,
  to,
  descriptionClamp = false,
  featured = false,
}: ProjectCardProps) {
  const tags = project.tags
    .filter((tag) => tag != null && String(tag).trim() !== "")
    .slice(0, MAX_TAGS);
  const hiddenTags = project.tags.length - tags.length;
  const hasActions = Boolean(project.githubUrl || project.liveUrl || project.links?.length);

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition duration-300",
        featured && "md:flex-row",
        to &&
          "hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-foreground/5 focus-within:ring-2 focus-within:ring-ring/50",
      )}
    >
      <div
        className={cn(
          "relative aspect-video w-full shrink-0 overflow-hidden border-b border-border/60 bg-muted",
          featured && "md:aspect-auto md:min-h-72 md:w-[55%] md:border-b-0 md:border-r",
        )}
      >
        <ImgLoader
          src={`/api/load/image${project.image}`}
          alt={project.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col p-5", featured && "md:justify-center md:p-8")}>
        <p className="mb-1.5 line-clamp-1 text-xs text-muted-foreground">{project.category}</p>
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "line-clamp-1 text-base font-semibold leading-snug tracking-tight",
              featured && "md:line-clamp-2 md:text-xl",
            )}
          >
            {to ? (
              <Link
                to={to}
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {project.title}
              </Link>
            ) : (
              project.title
            )}
          </h3>
          {to && (
            <ArrowUpRight
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          )}
        </div>

        <TextBlock
          text={project.description}
          className={cn(
            "mt-2 text-sm leading-relaxed text-muted-foreground",
            descriptionClamp && (featured ? "line-clamp-2 md:line-clamp-4" : "line-clamp-2"),
          )}
        />

        {tags.length > 0 && (
          <div className={cn("mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5", featured && "md:mt-0")}>
            {tags.map((tag, i) => (
              <Link
                key={`${tag}-${i}`}
                to={`/tags/${encodeURIComponent(tag)}`}
                className="relative z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 hover:[&>span]:text-foreground"
              >
                <TechTag name={String(tag)} />
              </Link>
            ))}
            {hiddenTags > 0 && (
              <span className="text-xs text-muted-foreground">+{hiddenTags} more</span>
            )}
          </div>
        )}

        {hasActions && (
          <div className="-mx-2 mt-4 flex flex-wrap items-center gap-1 border-t border-border/60 pt-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code on GitHub"
                className={actionClassName}
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View live site"
                className={actionClassName}
              >
                <Globe className="h-3.5 w-3.5" />
                Live
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
                  className={actionClassName}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
