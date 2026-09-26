import { data, Link, useLoaderData } from "react-router";
import { getStackById, getStackUsage } from "../../../lib/database/queries";
import type { StackUsageItem } from "../../../lib/database/queries";
import type { StackCategory } from "../../../lib/stack";
import { parseToolsString } from "../../../lib/stack";
import { Reveal } from "~/components/accessories/Rail/Rail";
import { TextBlock } from "~/components/accessories/TextBlock";
import { buildPageMeta } from "~/lib/seo";
import {
  DetailHeader,
  DetailNotFound,
  DetailShell,
  TagList,
} from "~/components/accessories/Detail/Detail";

const MORE_LINK = { to: "/stack", label: "See the full stack" };

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stack = await getStackById(id);
  if (!stack) return data(null, { status: 404 });
  const usage = await getStackUsage(id, 20, 0);
  return { stack, usage };
}

export function meta({ loaderData: data }: { loaderData: { stack: StackCategory } | null }) {
  if (!data?.stack) {
    return buildPageMeta({
      title: "Not found | Mohamed Amara",
      description: "Stack item not found.",
      noindex: true,
    });
  }
  const stack = data.stack;
  return buildPageMeta({
    title: `${stack.category} | Stack | Mohamed Amara`,
    description: stack.description ?? undefined,
    canonicalPath: `/stack/${stack.id}`,
    ogImage: `/og/stack/${stack.id}`,
  });
}

const KIND_LABEL: Record<StackUsageItem["kind"], string> = {
  project: "Project",
  experience: "Experience",
  blog: "Post",
};

const KIND_PATH: Record<StackUsageItem["kind"], string> = {
  project: "/projects",
  experience: "/experience",
  blog: "/blog",
};

export default function StackIdIndex() {
  const data = useLoaderData<typeof loader>();

  if (!data?.stack) {
    return <DetailNotFound what="stack" more={MORE_LINK} />;
  }

  const stack = data.stack as StackCategory;
  const usage = (data.usage ?? []) as StackUsageItem[];
  const tools = parseToolsString(stack.tools);

  return (
    <DetailShell>
      <DetailHeader
        eyebrow={`${tools.length} ${tools.length === 1 ? "tool" : "tools"}`}
        title={stack.category}
        lede={stack.description}
      />
      {tools.length > 0 && (
        <div className="mt-8">
          <TagList tags={tools} />
        </div>
      )}

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Where this shows up</h2>
        {usage.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            Nothing is linked to this part of the stack yet.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
            {usage.map((item, i) => (
              <li key={`${item.kind}-${item.id}`}>
                <Reveal delay={Math.min(i * 0.05, 0.25)}>
                  <Link
                    to={`${KIND_PATH[item.kind]}/${item.id}`}
                    className="group -mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 rounded-lg px-3 py-5 transition-colors hover:bg-muted/50 sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
                  >
                    <span className="text-xs text-muted-foreground sm:text-sm">
                      {KIND_LABEL[item.kind]}
                    </span>
                    <span className="order-first min-w-0 sm:order-none">
                      <span className="block font-medium">{item.title}</span>
                      {item.summary && (
                        <TextBlock
                          as="span"
                          text={item.summary}
                          className="mt-1 line-clamp-2 block text-sm text-muted-foreground"
                        />
                      )}
                    </span>
                    {(item.date || item.period) && (
                      <span className="hidden text-sm tabular-nums text-muted-foreground sm:block">
                        {item.date ?? item.period}
                      </span>
                    )}
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DetailShell>
  );
}
