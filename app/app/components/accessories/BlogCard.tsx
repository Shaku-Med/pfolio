import { Link } from "react-router";
import { type BlogPost, formatBlogDate } from "../../lib/blog";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { cn } from "~/lib/utils";
import { TextBlock } from "./TextBlock";

type BlogCardProps = {
  post: BlogPost;
  to?: string;
  variant?: "compact" | "full";
};

export default function BlogCard({ post, to, variant = "compact" }: BlogCardProps) {
  const coverSrc = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `/api/load/image${post.coverImage}`
    : undefined;
  const showCover = variant === "full" && coverSrc;
  const tags = variant === "full" ? (post.tags ?? []).filter(Boolean) : [];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition duration-300",
        to &&
          "hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-foreground/5 focus-within:ring-2 focus-within:ring-ring/50",
      )}
    >
      {showCover && (
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden border-b border-border/60 bg-muted">
          <ImgLoader
            src={coverSrc}
            alt={post.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {post.category}
          <span className="mx-1.5 text-border">/</span>
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug tracking-tight">
          {to ? (
            <Link to={to} className="outline-none after:absolute after:inset-0 after:content-['']">
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </h3>
        <TextBlock
          text={post.excerpt}
          className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
        />
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-5 text-xs text-muted-foreground">
          {post.readTime && <span>{post.readTime}</span>}
          {tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="relative z-10 transition-colors hover:text-foreground"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
