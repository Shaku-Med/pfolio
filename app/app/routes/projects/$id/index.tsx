import { ExternalLink, FileText, Globe, Video } from "lucide-react";
import { Github } from "~/components/ui/brand-icons";
import { data, useLoaderData } from "react-router";
import MarkdownBody from "~/components/accessories/MarkdownBody";
import { TextBlock } from "~/components/accessories/TextBlock";
import {
  DetailBody,
  DetailCover,
  DetailHeader,
  DetailNotFound,
  DetailShell,
  PROSE_CLASS,
  SideLink,
  SideSection,
  TagList,
} from "~/components/accessories/Detail/Detail";
import { getProjectById } from "~/lib/database/queries";
import type { Project, ProjectLink } from "~/lib/projects";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { useState } from "react";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { BASE_URL, buildPageMeta } from "~/lib/seo";

const MORE_LINK = { to: "/projects", label: "See all projects" };

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
  if (!project) return data(null, { status: 404 });
  return { project };
}

export function meta({ loaderData: data }: { loaderData: { project: Project } | null }) {
  if (!data?.project) {
    return buildPageMeta({
      title: "Not found | Mohamed Amara",
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
    title: `${project.title} | Mohamed Amara`,
    description: project.description,
    canonicalPath: `/projects/${project.id}`,
    ogImage,
    ogImageAlt: project.title,
  });
}

export default function ProjectIdIndex() {
  const data = useLoaderData<typeof loader>();
  const [imgColors, setImgColors] = useState<string[]>([]);

  if (!data?.project) {
    return <DetailNotFound what="project" more={MORE_LINK} />;
  }

  const project = data.project as Project;
  const hasLinks = Boolean(project.githubUrl || project.liveUrl || project.links?.length);
  const [lede, ...rest] = project.description.trim().split(/\s*\n+\s*/);
  const moreAbout = rest.join("\n\n");

  return (
    <DetailShell>
      <DetailHeader eyebrow={project.category} title={project.title} lede={lede} />

      <DetailCover>
        <CanvasGradient colors={imgColors} />
        <ImgLoader
          src={`/api/load/image${project.image}`}
          alt={project.imageAlt}
          loading="eager"
          className="h-full w-full"
          imageClassName="object-contain"
          shouldShowPreview
          getImgColors
          onGetImgColorsCallback={setImgColors}
        />
      </DetailCover>

      <DetailBody
        aside={
          <>
            {project.date && (
              <SideSection title="Shipped">
                <p>
                  {new Date(project.date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </SideSection>
            )}
            {project.tags.length > 0 && (
              <SideSection title="Built with">
                <TagList tags={project.tags} />
              </SideSection>
            )}
            {hasLinks && (
              <SideSection title="Links">
                {project.liveUrl && (
                  <SideLink
                    href={project.liveUrl}
                    label="Live site"
                    hint={project.liveUrl.replace(/^https?:\/\//, "")}
                    icon={Globe}
                  />
                )}
                {project.githubUrl && (
                  <SideLink
                    href={project.githubUrl}
                    label="Source code"
                    hint={project.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                    icon={Github}
                  />
                )}
                {project.links?.map((link) => (
                  <SideLink
                    key={link.url}
                    href={link.url}
                    label={link.label}
                    icon={link.icon ? linkIcons[link.icon] : FileText}
                  />
                ))}
              </SideSection>
            )}
          </>
        }
      >
        <div className="space-y-10">
          {moreAbout && (
            <TextBlock
              text={moreAbout}
              paragraphs
              className="text-[0.938rem] leading-[1.85] text-muted-foreground"
            />
          )}
          {project.detailsMd ? (
            <MarkdownBody content={project.detailsMd} className={PROSE_CLASS} />
          ) : (
            !moreAbout && (
              <p className="text-muted-foreground">More details on this one are coming soon.</p>
            )
          )}
        </div>
      </DetailBody>
    </DetailShell>
  );
}
