-- Blog list RPCs: do not return body (large markdown). Body is only loaded
-- when fetching a single post by id (e.g. getBlogPostById / .from("blog_posts").select("*").eq("id", id)).
--
-- Run this in the Supabase SQL Editor. Drop and recreate the list functions
-- so they return only columns needed for cards/lists.

DROP FUNCTION IF EXISTS get_blog_posts(integer, integer);
DROP FUNCTION IF EXISTS get_selected_blog(integer, integer);

-- get_blog_posts: paginated list for blog index (no body)
CREATE FUNCTION get_blog_posts(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  category text,
  excerpt text,
  date text,
  read_time text,
  tags text[],
  cover_image text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    b.slug,
    b.title,
    b.category,
    b.excerpt,
    b.date,
    b.read_time,
    b.tags,
    b.cover_image
  FROM blog_posts b
  ORDER BY b.date DESC NULLS LAST, b.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

-- get_selected_blog: only posts in selected_items (table_name = 'blog_posts'). No body.
CREATE FUNCTION get_selected_blog(p_limit int DEFAULT 4, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  category text,
  excerpt text,
  date text,
  read_time text,
  tags text[],
  cover_image text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    b.slug,
    b.title,
    b.category,
    b.excerpt,
    b.date,
    b.read_time,
    b.tags,
    b.cover_image
  FROM blog_posts b
  INNER JOIN selected_items si ON si.table_name = 'blog_posts' AND si.item_id = b.id
  ORDER BY si.created_at, b.date DESC NULLS LAST, b.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;
