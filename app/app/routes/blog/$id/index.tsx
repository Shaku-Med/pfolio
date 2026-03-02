import { Link, useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { getBlogPostById } from "../../../lib/database/queries";
import { formatBlogDate, type BlogPost } from "../../../lib/blog";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "~/lib/tech/TechTag";
import { BASE_URL, buildPageMeta } from "~/lib/seo";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { useState } from "react";

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) return null;
  return { post };
}

export function meta({ data }: { data: { post: BlogPost } | null }) {
  if (!data?.post) {
    return buildPageMeta({
      title: "Not found – Mohamed Amara",
      description: "Post not found.",
      noindex: true,
    });
  }
  const post = data.post;
  const ogImage = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `${BASE_URL}/api/load/image${post.coverImage}`
    : undefined;
  return buildPageMeta({
    title: `${post.title} – Blog – Mohamed Amara`,
    description: post.excerpt ?? undefined,
    canonicalPath: `/blog/${post.id}`,
    ogImage,
    ogImageAlt: post.title,
  });
}

export default function BlogPostPage() {
  const data = useLoaderData<typeof loader>();
  const [imgColors, setImgColors] = useState<string[]>([]);
  if (!data?.post) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-lg text-muted-foreground">Post not found.</p>
      </main>
    );
  }

  const post = data.post;

  const coverSrc = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `/api/load/image${post.coverImage}`
    : undefined;

  return (
    <main className="mx-auto max-w-6xl px-5 py-2 sm:py-5 md:py-6">
      <article>
        {/* ────────────────────────────────────────────
            HERO — cinematic cover image with scrim
        ──────────────────────────────────────────── */}
        {coverSrc && (
          <div className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-3xl">
            <div className="aspect-[21/9] w-full bg-muted">
              <CanvasGradient colors={imgColors} />
              <ImgLoader
                src={coverSrc}
                alt={post.title}
                loading="lazy"
                className="h-full w-full"
                imageClassName="object-cover"
                fetchPriority="high"
                getImgColors={true}
                onGetImgColorsCallback={(colors) => {
                  setImgColors(colors);
                }}
                shouldShowPreview={true}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                {post.category}
              </span>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────
            SIDE-BY-SIDE — content + sticky sidebar
        ──────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[1fr_17rem]">
          {/* ── Left column: main content ── */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.65rem]">
              {post.title}
            </h1>

            {/* Excerpt as lede */}
            {post.excerpt && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <hr className="my-8 border-border/50" />

            {/* Body */}
            <div className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.85] prose-a:text-primary prose-a:underline-offset-4 prose-img:rounded-xl prose-pre:bg-muted prose-pre:border prose-pre:border-border/40 prose-code:text-[0.875em] max-w-none text-[0.938rem]">
              <MarkdownBody content={post.body} />
            </div>
          </div>

          {/* ── Right column: sticky sidebar ── */}
          <aside className="lg:pt-1">
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Date & read time */}
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  Published
                </h3>
                <p className="text-sm text-muted-foreground">
                  <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                </p>
                {post.readTime && (
                  <p className="mt-1 text-sm text-muted-foreground/70">
                    {post.readTime}
                  </p>
                )}
              </div>

              {/* Category — only show if no cover image (otherwise it's on the hero) */}
              {!coverSrc && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Category
                  </h3>
                  <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                    {post.category}
                  </span>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
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
}