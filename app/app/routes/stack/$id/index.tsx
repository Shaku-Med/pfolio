import { Link, useLoaderData } from "react-router";
import { getStackById, getStackUsage } from "../../../lib/database/queries";
import type { StackCategory } from "../../../lib/stack";
import { parseToolsString } from "../../../lib/stack";
import { TechTag } from "~/lib/tech/TechTag";
import { buildPageMeta } from "~/lib/seo";

type StackUsageItem = Awaited<ReturnType<typeof getStackUsage>>[number];

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stack = await getStackById(id);
  if (!stack) return null;
  const usage = await getStackUsage(id, 20, 0);
  return { stack, usage };
}

export function meta({ data }: { data: { stack: StackCategory } | null }) {
  if (!data?.stack) {
    return buildPageMeta({
      title: "Not found – Mohamed Amara",
      description: "Stack item not found.",
      noindex: true,
    });
  }
  const stack = data.stack;
  return buildPageMeta({
    title: `${stack.category} – Stack – Mohamed Amara`,
    description: stack.description ?? undefined,
    canonicalPath: `/stack/${stack.id}`,
  });
}

export default function StackIdIndex() {
  const data = useLoaderData<typeof loader>();

  if (!data?.stack) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-2 sm:py-5 md:py-6">
        <p className="text-muted-foreground">Stack item not found.</p>
      </main>
    );
  }

  const stack = data.stack as StackCategory;
  const usage = (data.usage ?? []) as StackUsageItem[];
  const tools = parseToolsString(stack.tools);

  return (
    <main className="mx-auto max-w-6xl px-4 py-2 sm:py-5 md:py-6">
      <section className="space-y-3 border-b border-border/60 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
          Stack
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {stack.category}
        </h1>
        <p className="text-sm text-muted-foreground">{stack.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tools.map((tool) => (
              <Link to={`/tags/${encodeURIComponent(tool)}`} key={tool}>
                <TechTag name={tool} />
              </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Where this shows up
        </h2>
        {usage.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects, experience, or posts are linked to this stack yet.
          </p>
        ) : (
          <div className="space-y-3">
            {usage.map((item) => {
              const href =
                item.kind === "project"
                  ? `/projects/${item.id}`
                  : item.kind === "experience"
                    ? `/experience/${item.id}`
                    : `/blog/${item.id}`;

              return (
                <Link
                  key={`${item.kind}-${item.id}`}
                  to={href}
                  className="block rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 transition hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
                        {item.kind}
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      {item.summary && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.summary}
                        </p>
                      )}
                    </div>
                    {(item.date || item.period) && (
                      <p className="shrink-0 text-[11px] text-muted-foreground">
                        {item.date ?? item.period}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

