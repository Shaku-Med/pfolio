import { Link } from "react-router";
import BlogCard from "../../../../components/accessories/BlogCard";
import { useContextHook } from "../../../../components/accessories/context/Context";

const BlogSection = () => {
  const { blog_posts } = useContextHook();
  if (!blog_posts.length) return null;

  return (
    <section id="blog" className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Notes & writing</h2>
        <Link
          to="/blog"
          className="text-xs font-medium text-primary hover:underline"
        >
          View more
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {blog_posts.map((post) => (
          <div key={post.id} className="min-w-0">
            <BlogCard to={`/blog/${post.id}`} post={post} variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;

