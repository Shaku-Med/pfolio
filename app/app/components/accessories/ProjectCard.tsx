import {
  ExternalLink,
  FileText,
  Github,
  Globe,
  type LucideIcon,
  Video,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Project, ProjectLink } from "../../lib/projects";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "../../lib/tech/TechTag";
import { TextBlock } from "./TextBlock";

const linkIcons: Record<NonNullable<ProjectLink["icon"]>, LucideIcon> = {
  doc: FileText,
  video: Video,
  external: ExternalLink,
  article: FileText,
};

const cardClassName =
  "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/80 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md";

type ProjectCardProps = {
  project: Project;
  to?: string;
  descriptionClamp?: boolean;
};

export default function ProjectCard({
  project,
  to,
  descriptionClamp = false,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const maxTags = 3;
  const tags = project.tags.slice(0, maxTags).filter(
    (tag) => tag != null && String(tag).trim() !== ""
  );

  const content = (
    <div className="flex h-full w-full flex-col">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
        <ImgLoader
          src={`/api/load/image${project.image}`}
          alt={project.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2.5 left-2.5 rounded-full border border-border/60 bg-background/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground backdrop-blur-sm">
          {project.category}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug line-clamp-1 sm:text-base">
          {project.title}
        </h3>
        <TextBlock
          text={project.description}
          className={`mt-1.5 text-xs text-muted-foreground ${descriptionClamp ? "line-clamp-2" : ""}`}
        />
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3 text-[11px] text-muted-foreground">
          {tags.map((tag, i) => {
            const tagUrl = `/tags/${encodeURIComponent(tag)}`;
            if (to) {
              return (
                <span
                  key={`${tag}-${i}`}
                  role="link"
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(tagUrl);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(tagUrl);
                    }
                  }}
                >
                  <TechTag name={String(tag)} />
                </span>
              );
            }
            return (
              <Link
                key={`${tag}-${i}`}
                to={tagUrl}
                className="focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full"
              >
                <TechTag name={String(tag)} />
              </Link>
            );
          })}
          {project.tags.length > maxTags && (
            <span className="text-[11px] text-muted-foreground">
              +{project.tags.length - maxTags}
            </span>
          )}
        </div>
        {(project.githubUrl || project.liveUrl || project.links?.length) ? (
          <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border/60 pt-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code on GitHub"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={to ? (e) => e.stopPropagation() : undefined}
              >
                <Github className="h-3.5 w-3.5" />
                <span className="text-[11px]">Source</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View live preview"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={to ? (e) => e.stopPropagation() : undefined}
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="text-[11px]">Live</span>
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
                  aria-label={link.label}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={to ? (e) => e.stopPropagation() : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px]">{link.label}</span>
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
