import BlogCard from "../../../../components/accessories/BlogCard";
import { Reveal, SectionHeader } from "../../../../components/accessories/Rail/Rail";
import { useContextHook } from "../../../../components/accessories/context/Context";

const BlogSection = () => {
  const { blog_posts } = useContextHook();
  if (!blog_posts.length) return null;

  return (
    <section id="blog" className="space-y-4">
      <SectionHeader title="Notes & writing" to="/blog" />
      <div className="grid gap-3 md:grid-cols-3">
        {blog_posts.map((post, i) => (
          <Reveal key={post.id} delay={Math.min(i * 0.07, 0.28)} className="min-w-0">
            <BlogCard to={`/blog/${post.id}`} post={post} variant="compact" />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
