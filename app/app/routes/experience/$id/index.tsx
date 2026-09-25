import { data, useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { TextBlock } from "../../../components/accessories/TextBlock";
import { getExperienceById } from "../../../lib/database/queries";
import type { ExperienceEntry } from "../../../lib/experience";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { RailList } from "~/components/accessories/Rail/Rail";
import {
  DetailBody,
  DetailHeader,
  DetailNotFound,
  DetailShell,
  PROSE_CLASS,
  SideSection,
  TagList,
} from "~/components/accessories/Detail/Detail";
import { BASE_URL, buildPageMeta } from "~/lib/seo";

const MORE_LINK = { to: "/experience", label: "See all experience" };

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getExperienceById(id);
  if (!entry) return data(null, { status: 404 });
  return { entry };
}

export function meta({ loaderData: data }: { loaderData: { entry: ExperienceEntry } | null }) {
  if (!data?.entry) {
    return buildPageMeta({
      title: "Not found | Mohamed Amara",
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
    title: `${entry.title ?? entry.role ?? entry.company} | Mohamed Amara`,
    description: entry.description ?? undefined,
    canonicalPath: `/experience/${entry.id}`,
    ogImage,
    ogImageAlt: entry.company ?? entry.title ?? undefined,
  });
}

function logoSrc(logo?: string) {
  if (!logo) return undefined;
  return logo.startsWith("http") ? logo : `/api/load/image${logo}`;
}

const ExperienceIdIndex = () => {
  const data = useLoaderData<typeof loader>();
  const entry = data?.entry as ExperienceEntry | undefined;

  if (!entry) {
    return <DetailNotFound what="role" more={MORE_LINK} />;
  }

  const logo = logoSrc(entry.logo);
  const sections = [
    { title: "Key highlights", items: entry.highlights },
    { title: "Challenges", items: entry.challenges },
    { title: "What I learned", items: entry.learnings },
  ].filter((section) => section.items && section.items.length > 0);

  return (
    <DetailShell>
      <div className="flex items-center gap-4">
        {logo && (
          <ImgLoader
            src={logo}
            alt={entry.company ?? entry.title}
            className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted"
            imageClassName="object-cover"
            shouldShowPreview
          />
        )}
        <p className="text-sm text-muted-foreground">
          {[entry.company, entry.period].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="mt-6">
        <DetailHeader title={entry.title} lede={entry.description} />
      </div>

      <DetailBody
        aside={
          <>
            {entry.role && (
              <SideSection title="Role">
                <p>{entry.role}</p>
              </SideSection>
            )}
            {entry.company && (
              <SideSection title="Company">
                <p>{entry.company}</p>
              </SideSection>
            )}
            <SideSection title="When">
              <p>{entry.period}</p>
            </SideSection>
            {entry.location && (
              <SideSection title="Where">
                <p>{entry.location}</p>
              </SideSection>
            )}
            {entry.tags && entry.tags.length > 0 && (
              <SideSection title="Built with">
                <TagList tags={entry.tags} />
              </SideSection>
            )}
          </>
        }
      >
        <div className="space-y-12">
          {entry.detailsMd && <MarkdownBody content={entry.detailsMd} className={PROSE_CLASS} />}

          {entry.developmentSummary && (
            <section>
              <h2 className="text-xl font-semibold tracking-tight">How the work went</h2>
              <TextBlock
                text={entry.developmentSummary}
                paragraphs
                className="mt-3 text-[0.938rem] leading-[1.85] text-muted-foreground"
              />
            </section>
          )}

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <RailList items={section.items ?? []} />
            </section>
          ))}
        </div>
      </DetailBody>
    </DetailShell>
  );
};

export default ExperienceIdIndex;
