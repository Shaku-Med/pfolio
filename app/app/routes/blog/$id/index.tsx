import { data, useLoaderData } from "react-router";
import MarkdownBody from "../../../components/accessories/MarkdownBody";
import { getBlogPostById } from "../../../lib/database/queries";
import { formatBlogDate, type BlogPost } from "../../../lib/blog";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { BASE_URL, blogPostStructuredData, buildPageMeta } from "~/lib/seo";
import CanvasGradient from "~/components/accessories/CanvasGradient/CanvasGradient";
import { useState } from "react";
import {
  DetailBody,
  DetailCover,
  DetailHeader,
  DetailNotFound,
  DetailShell,
  PROSE_CLASS,
  SideSection,
  TagList,
} from "~/components/accessories/Detail/Detail";

const MORE_LINK = { to: "/blog", label: "See all posts" };

export async function loader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) return data(null, { status: 404 });
  return { post };
}

export function meta({ loaderData: data }: { loaderData: { post: BlogPost } | null }) {
  if (!data?.post) {
    return buildPageMeta({
      title: "Not found | Mohamed Amara",
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
    title: `${post.title} | Blog | Mohamed Amara`,
    description: post.excerpt ?? undefined,
    canonicalPath: `/blog/${post.id}`,
    ogImage,
    ogImageAlt: post.title,
    ogType: "article",
    extra: [blogPostStructuredData(post, ogImage)],
  });
}

export default function BlogPostPage() {
  const data = useLoaderData<typeof loader>();
  const [imgColors, setImgColors] = useState<string[]>([]);

  if (!data?.post) {
    return <DetailNotFound what="post" more={MORE_LINK} />;
  }

  const post = data.post;
  const coverSrc = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `/api/load/image${post.coverImage}`
    : undefined;

  return (
    <DetailShell>
      <DetailHeader
        eyebrow={
          <>
            {post.category}
            <span className="mx-2 text-border">/</span>
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            {post.readTime && (
              <>
                <span className="mx-2 text-border">/</span>
                {post.readTime}
              </>
            )}
          </>
        }
        title={post.title}
        lede={post.excerpt}
      />

      {coverSrc && (
        <DetailCover>
          <CanvasGradient colors={imgColors} />
          <ImgLoader
            src={coverSrc}
            alt={post.title}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full"
            imageClassName="object-cover"
            shouldShowPreview
            getImgColors
            onGetImgColorsCallback={setImgColors}
          />
        </DetailCover>
      )}

      <DetailBody
        aside={
          post.tags && post.tags.length > 0 ? (
            <SideSection title="Tagged">
              <TagList tags={post.tags} />
            </SideSection>
          ) : undefined
        }
      >
        <MarkdownBody content={post.body} className={PROSE_CLASS} />
      </DetailBody>
    </DetailShell>
  );
}
