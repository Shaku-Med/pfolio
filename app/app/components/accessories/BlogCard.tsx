import { Link } from "react-router";
import { type BlogPost, formatBlogDate } from "../../lib/blog";
import { Separator } from "@heroui/react";
import ImgLoader from "~/lib/utils/Image/ImgLoader";

type BlogCardProps = {
  post: BlogPost;
  to?: string;
  /** Compact style for home section; full style for blog index */
  variant?: "compact" | "full";
};

export default function BlogCard({ post, to, variant = "compact" }: BlogCardProps) {
  const cardClassName =
    "flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/80 transition hover:border-primary/40 hover:shadow-sm";

  const coverSrc = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `/api/load/image${post.coverImage}`
    : undefined;

  const content = (
    <div className="flex min-h-0 flex-1 flex-col">
      {variant === "full" && coverSrc && (
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-muted">
          <ImgLoader
            src={coverSrc}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />

        {variant === "full" && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1.5 text-[11px] text-white/95 shadow-sm backdrop-blur-sm">
            <time dateTime={post.date}>
              {formatBlogDate(post.date)}
            </time>
            {post.readTime && (
              <>
                <span className="mx-1.5 opacity-70">·</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase line-clamp-1 tracking-[0.18em] text-primary/80">
              {post.category}
            </span>
       
          </div>
          <h3 className="text-sm font-semibold line-clamp-1 leading-snug sm:text-base">
            {post.title}
          </h3>
        </div>
        <p className="flex-1 text-xs line-clamp-2 leading-relaxed text-muted-foreground sm:text-sm">
          {post.excerpt}
        </p>
        {variant === "full" && post.tags && post.tags.length > 0 && (
          <>
          <Separator/>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link to={`/tags/${encodeURIComponent(tag)}`} key={tag}>
                  <span
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] line-clamp-1 font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                </Link>
              ))}
            </div>
          
          </>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={`block ${cardClassName}`}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
