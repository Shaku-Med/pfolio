-- get_stack_usage: search projects, experience, and blog_posts for a given stack.
-- It looks up the stack row by id and uses the tools string (comma-separated)
-- as search tokens across titles, descriptions, excerpts, and tags.
--
-- Run this in the Supabase SQL Editor. If your `stack.id` is uuid, the cast
-- to text in the WHERE clause is fine; if it's text already, it's also fine.

CREATE OR REPLACE FUNCTION get_stack_usage(
  p_stack_id text,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  kind text,
  id uuid,
  title text,
  summary text,
  tags text[],
  cover_image text,
  period text,
  date text
)
LANGUAGE sql
STABLE
AS $$
  WITH s AS (
    SELECT category, tools
    FROM stack
    WHERE id::text = p_stack_id
    LIMIT 1
  ),
  tokens AS (
    SELECT trim(unnest(string_to_array(s.tools, ','))) AS token
    FROM s
    WHERE s.tools IS NOT NULL AND s.tools <> ''
  ),
  project_matches AS (
    SELECT
      'project'::text AS kind,
      p.id,
      p.title,
      p.description AS summary,
      p.tags,
      p.image AS cover_image,
      NULL::text AS period,
      NULL::text AS date
    FROM projects p
    WHERE EXISTS (
      SELECT 1
      FROM tokens t
      WHERE t.token <> ''
        AND (
          p.title ILIKE '%' || t.token || '%'
          OR p.description ILIKE '%' || t.token || '%'
          OR t.token = ANY(p.tags)
        )
    )
  ),
  experience_matches AS (
    SELECT
      'experience'::text AS kind,
      e.id,
      e.title,
      e.description AS summary,
      e.tags,
      e.logo AS cover_image,
      NULLIF(
        trim(
          COALESCE(e.period->>'from', '') || ' – ' || COALESCE(e.period->>'to', '')
        ),
        ''
      ) AS period,
      NULL::text AS date
    FROM experience e
    WHERE EXISTS (
      SELECT 1
      FROM tokens t
      WHERE t.token <> ''
        AND (
          e.title ILIKE '%' || t.token || '%'
          OR e.description ILIKE '%' || t.token || '%'
          OR t.token = ANY(e.tags)
        )
    )
  ),
  blog_matches AS (
    SELECT
      'blog'::text AS kind,
      b.id,
      b.title,
      b.excerpt AS summary,
      b.tags,
      b.cover_image,
      NULL::text AS period,
      b.date::text AS date
    FROM blog_posts b
    WHERE EXISTS (
      SELECT 1
      FROM tokens t
      WHERE t.token <> ''
        AND (
          b.title ILIKE '%' || t.token || '%'
          OR b.excerpt ILIKE '%' || t.token || '%'
          OR t.token = ANY(b.tags)
        )
    )
  ),
  all_matches AS (
    SELECT * FROM project_matches
    UNION ALL
    SELECT * FROM experience_matches
    UNION ALL
    SELECT * FROM blog_matches
  )
  SELECT *
  FROM all_matches
  ORDER BY
    kind,
    COALESCE(date, period, title),
    title
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

