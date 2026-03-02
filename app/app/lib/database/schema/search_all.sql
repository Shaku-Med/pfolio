-- search_all: text-based search across projects, experience, stack, blog_posts, and gallery.
-- Uses PostgreSQL full-text search; can be swapped to pgvector later.
--
-- Run this in the Supabase SQL Editor. Requires tsvector/tsquery, no extra extensions.

CREATE OR REPLACE FUNCTION search_all(
  p_query text,
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
  WITH q AS (
    SELECT plainto_tsquery('english', coalesce(p_query, '')) AS tsq
  ),
  project_hits AS (
    SELECT
      'project'::text AS kind,
      p.id,
      p.title,
      p.description AS summary,
      '/projects/' || p.id::text AS href,
      to_tsvector(
        'english',
        coalesce(p.title, '') || ' ' ||
        coalesce(p.description, '') || ' ' ||
        array_to_string(coalesce(p.tags, ARRAY[]::text[]), ' ') || ' ' ||
        coalesce(p.github_url, '') || ' ' ||
        coalesce(p.live_url, '') || ' ' ||
        coalesce(p.links::text, '') || ' ' ||
        coalesce(p.details_md, '')
      ) AS document,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(p.title, '') || ' ' ||
          coalesce(p.description, '') || ' ' ||
          array_to_string(coalesce(p.tags, ARRAY[]::text[]), ' ') || ' ' ||
          coalesce(p.github_url, '') || ' ' ||
          coalesce(p.live_url, '') || ' ' ||
          coalesce(p.links::text, '') || ' ' ||
          coalesce(p.details_md, '')
        ),
        (SELECT tsq FROM q)
      ) AS rank
    FROM projects p, q
    WHERE (SELECT tsq FROM q) @@ to_tsvector(
      'english',
      coalesce(p.title, '') || ' ' ||
      coalesce(p.description, '') || ' ' ||
      array_to_string(coalesce(p.tags, ARRAY[]::text[]), ' ') || ' ' ||
      coalesce(p.github_url, '') || ' ' ||
      coalesce(p.live_url, '') || ' ' ||
      coalesce(p.links::text, '') || ' ' ||
      coalesce(p.details_md, '')
    )
  ),
  experience_hits AS (
    SELECT
      'experience'::text AS kind,
      e.id,
      e.title,
      e.description AS summary,
      '/experience/' || e.id::text AS href,
      to_tsvector(
        'english',
        coalesce(e.title, '') || ' ' ||
        coalesce(e.description, '') || ' ' ||
        coalesce(e.company, '') || ' ' ||
        coalesce(e.location, '') || ' ' ||
        array_to_string(coalesce(e.highlights, ARRAY[]::text[]), ' ') || ' ' ||
        array_to_string(coalesce(e.tags, ARRAY[]::text[]), ' ') || ' ' ||
        array_to_string(coalesce(e.challenges, ARRAY[]::text[]), ' ') || ' ' ||
        array_to_string(coalesce(e.learnings, ARRAY[]::text[]), ' ') || ' ' ||
        coalesce(e.development_summary, '') || ' ' ||
        coalesce(e.details_md, '')
      ) AS document,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(e.title, '') || ' ' ||
          coalesce(e.description, '') || ' ' ||
          coalesce(e.company, '') || ' ' ||
          coalesce(e.location, '') || ' ' ||
          array_to_string(coalesce(e.highlights, ARRAY[]::text[]), ' ') || ' ' ||
          array_to_string(coalesce(e.tags, ARRAY[]::text[]), ' ') || ' ' ||
          array_to_string(coalesce(e.challenges, ARRAY[]::text[]), ' ') || ' ' ||
          array_to_string(coalesce(e.learnings, ARRAY[]::text[]), ' ') || ' ' ||
          coalesce(e.development_summary, '') || ' ' ||
          coalesce(e.details_md, '')
        ),
        (SELECT tsq FROM q)
      ) AS rank
    FROM experience e, q
    WHERE (SELECT tsq FROM q) @@ to_tsvector(
      'english',
      coalesce(e.title, '') || ' ' ||
      coalesce(e.description, '') || ' ' ||
      coalesce(e.company, '') || ' ' ||
      coalesce(e.location, '') || ' ' ||
      array_to_string(coalesce(e.highlights, ARRAY[]::text[]), ' ') || ' ' ||
      array_to_string(coalesce(e.tags, ARRAY[]::text[]), ' ') || ' ' ||
      array_to_string(coalesce(e.challenges, ARRAY[]::text[]), ' ') || ' ' ||
      array_to_string(coalesce(e.learnings, ARRAY[]::text[]), ' ') || ' ' ||
      coalesce(e.development_summary, '') || ' ' ||
      coalesce(e.details_md, '')
    )
  ),
  stack_hits AS (
    SELECT
      'stack'::text AS kind,
      s.id,
      s.category AS title,
      s.tools AS summary,
      '/stack/' || s.id::text AS href,
      to_tsvector(
        'english',
        coalesce(s.category, '') || ' ' ||
        coalesce(s.tools, '') || ' ' ||
        coalesce(s.description, '')
      ) AS document,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(s.category, '') || ' ' ||
          coalesce(s.tools, '') || ' ' ||
          coalesce(s.description, '')
        ),
        (SELECT tsq FROM q)
      ) AS rank
    FROM stack s, q
    WHERE (SELECT tsq FROM q) @@ to_tsvector(
      'english',
      coalesce(s.category, '') || ' ' ||
      coalesce(s.tools, '') || ' ' ||
      coalesce(s.description, '')
    )
  ),
  blog_hits AS (
    SELECT
      'blog'::text AS kind,
      b.id,
      b.title,
      b.excerpt AS summary,
      '/blog/' || b.id::text AS href,
      to_tsvector(
        'english',
        coalesce(b.title, '') || ' ' ||
        coalesce(b.excerpt, '') || ' ' ||
        array_to_string(coalesce(b.tags, ARRAY[]::text[]), ' ') || ' ' ||
        coalesce(b.body, '')
      ) AS document,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(b.title, '') || ' ' ||
          coalesce(b.excerpt, '') || ' ' ||
          array_to_string(coalesce(b.tags, ARRAY[]::text[]), ' ') || ' ' ||
          coalesce(b.body, '')
        ),
        (SELECT tsq FROM q)
      ) AS rank
    FROM blog_posts b, q
    WHERE (SELECT tsq FROM q) @@ to_tsvector(
      'english',
      coalesce(b.title, '') || ' ' ||
      coalesce(b.excerpt, '') || ' ' ||
      array_to_string(coalesce(b.tags, ARRAY[]::text[]), ' ') || ' ' ||
      coalesce(b.body, '')
    )
  ),
  resume_hits AS (
    SELECT
      'resume'::text AS kind,
      '00000000-0000-0000-0000-000000000000'::uuid AS id,
      'Resume'::text AS title,
      'Matches in resume'::text AS summary,
      '/resume'::text AS href,
      to_tsvector(
        'english',
        coalesce(r.body_md, '')
      ) AS document,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(r.body_md, '')
        ),
        (SELECT tsq FROM q)
      ) AS rank
    FROM resume r, q
    WHERE (SELECT tsq FROM q) @@ to_tsvector(
      'english',
      coalesce(r.body_md, '')
    )
  ),
  gallery_hits AS (
    SELECT
      'gallery'::text AS kind,
      g.id,
      g.title,
      g.subtitle AS summary,
      '/gallery/' || g.id::text AS href,
      to_tsvector(
        'english',
        coalesce(g.title, '') || ' ' ||
        coalesce(g.subtitle, '') || ' ' ||
        coalesce(g.project_srcs::text, '') || ' ' ||
        coalesce(g.details_md, '')
      ) AS document,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(g.title, '') || ' ' ||
          coalesce(g.subtitle, '') || ' ' ||
          coalesce(g.project_srcs::text, '') || ' ' ||
          coalesce(g.details_md, '')
        ),
        (SELECT tsq FROM q)
      ) AS rank
    FROM gallery g, q
    WHERE (SELECT tsq FROM q) @@ to_tsvector(
      'english',
      coalesce(g.title, '') || ' ' ||
      coalesce(g.subtitle, '') || ' ' ||
      coalesce(g.project_srcs::text, '') || ' ' ||
      coalesce(g.details_md, '')
    )
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
    SELECT * FROM resume_hits
    UNION ALL
    SELECT * FROM gallery_hits
  )
  SELECT kind, id, title, summary, href
  FROM all_hits
  ORDER BY rank DESC, kind, title
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

