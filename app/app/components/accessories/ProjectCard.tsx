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
import { Card } from "@heroui/react";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "../../lib/tech/TechTag";

const linkIcons: Record<NonNullable<ProjectLink["icon"]>, LucideIcon> = {
  doc: FileText,
  video: Video,
  external: ExternalLink,
  article: FileText,
};

const cardClassName =
  "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/80 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md";

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
    <>
     <Card className="flex h-full w-full flex-col p-0">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-3xl bg-muted">
          <ImgLoader
            src={`/api/load/image${project.image}`}
            alt={project.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between p-4 w-full">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
              {project.category}
            </p>
            <h3 className="text-sm font-semibold line-clamp-1 leading-snug sm:text-base">{project.title}</h3>
            <p
              className={`text-xs text-muted-foreground ${descriptionClamp ? "line-clamp-2" : ""}`}
            >
              {project.description}
            </p>
          </div>
          <Card.Footer className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
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
            {
              project.tags.length > maxTags && (
                <span className="text-[11px] text-muted-foreground">
                  +{project.tags.length - maxTags}
                </span>
              )
            }
          </Card.Footer>
          {
            (!project.githubUrl && !project.liveUrl && !project.links?.length) ? null : (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 w-full">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View source code on GitHub"
                    className="flex items-center gap-1.5 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={to ? (e) => e.stopPropagation() : undefined}
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-[11px]">Source</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View live preview"
                    className="flex items-center gap-1.5 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={to ? (e) => e.stopPropagation() : undefined}
                  >
                    <Globe className="h-4 w-4" />
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
                      className="flex items-center gap-1.5 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      onClick={to ? (e) => e.stopPropagation() : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{link.label}</span>
                    </a>
                  );
                })}
              </div>
            )
          }
        </div>
     </Card>
    </>
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
