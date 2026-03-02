-- search_by_tag: find items across projects, experience, stack, blog_posts, and gallery
-- that mention a given tag. For array columns we match exact tag (case-insensitive);
-- for text columns we use ILIKE.
--
-- Run this in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION search_by_tag(
  p_tag text,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  kind text,
  id uuid,
  title text,
  summary text,
  href text
)
LANGUAGE sql
STABLE
AS $$
  WITH t AS (
    SELECT lower(trim(coalesce(p_tag, ''))) AS tag
  ),
  project_hits AS (
    SELECT
      'project'::text AS kind,
      p.id,
      p.title,
      p.description AS summary,
      '/projects/' || p.id::text AS href
    FROM projects p, t
    WHERE EXISTS (
      SELECT 1
      FROM unnest(coalesce(p.tags, ARRAY[]::text[])) AS x(tag)
      WHERE lower(trim(x.tag)) = t.tag
    )
  ),
  experience_hits AS (
    SELECT
      'experience'::text AS kind,
      e.id,
      e.title,
      e.description AS summary,
      '/experience/' || e.id::text AS href
    FROM experience e, t
    WHERE EXISTS (
      SELECT 1
      FROM unnest(coalesce(e.tags, ARRAY[]::text[])) AS x(tag)
      WHERE lower(trim(x.tag)) = t.tag
    )
  ),
  blog_hits AS (
    SELECT
      'blog'::text AS kind,
      b.id,
      b.title,
      b.excerpt AS summary,
      '/blog/' || b.id::text AS href
    FROM blog_posts b, t
    WHERE EXISTS (
      SELECT 1
      FROM unnest(coalesce(b.tags, ARRAY[]::text[])) AS x(tag)
      WHERE lower(trim(x.tag)) = t.tag
    )
  ),
  stack_hits AS (
    SELECT
      'stack'::text AS kind,
      s.id,
      s.category AS title,
      s.tools AS summary,
      '/stack/' || s.id::text AS href
    FROM stack s, t
    WHERE lower(coalesce(s.tools, '')) ILIKE '%' || t.tag || '%'
  ),
  gallery_hits AS (
    SELECT
      'gallery'::text AS kind,
      g.id,
      g.title,
      g.subtitle AS summary,
      '/gallery/' || g.id::text AS href
    FROM gallery g, t
    WHERE
      lower(coalesce(g.title, '')) ILIKE '%' || t.tag || '%'
      OR lower(coalesce(g.subtitle, '')) ILIKE '%' || t.tag || '%'
  ),
  all_hits AS (
    SELECT * FROM project_hits
    UNION ALL
    SELECT * FROM experience_hits
    UNION ALL
    SELECT * FROM stack_hits
    UNION ALL
    SELECT * FROM blog_hits
    UNION ALL
    SELECT * FROM gallery_hits
  )
  SELECT kind, id, title, summary, href
  FROM all_hits
  ORDER BY kind, title
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

