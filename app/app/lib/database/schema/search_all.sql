-- search_all: advanced natural-language search across portfolio content.
--
-- Run in the Supabase SQL Editor (after base tables exist).
--
-- Query understanding (examples):
--   react next            → AND of stemmed terms + prefix matches
--   "design system"       → exact phrase
--   react OR vue          → either term
--   typescript -blog      → include typescript, exclude "blog"
--   kind:project react    → only projects
--   type:blog draft       → only blog posts
--   tag:react             → tag / tools / category match
--   #nextjs               → same as tag:nextjs
--   in:stack node         → only stack entries
--
-- Matching layers:
--   1) websearch_to_tsquery (phrase / OR / -negation)
--   2) prefix tsquery (partial words while typing)
--   3) ILIKE + pg_trgm similarity fallback (typos / near matches)
-- Ranking: title > tags/tools > body, plus exact/prefix title boosts.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_clean_query(p_query text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both FROM regexp_replace(coalesce(p_query, ''), '\s+', ' ', 'g'));
$$;

-- Strip filter tokens (kind:/type:/in:/tag:/#...) leaving free-text for FTS.
CREATE OR REPLACE FUNCTION search_free_text(p_query text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both FROM regexp_replace(
    regexp_replace(
      search_clean_query(p_query),
      '(?i)\m(kind|type|in)\s*:\s*\w+',
      ' ',
      'g'
    ),
    '(?i)(\mtag\s*:\s*[\w.+#-]+|#\w[\w.+-]*)',
    ' ',
    'g'
  ));
$$;

CREATE OR REPLACE FUNCTION search_kind_filter(p_query text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(lower((
    SELECT m[1]
    FROM regexp_matches(
      search_clean_query(p_query),
      '(?i)\m(?:kind|type|in)\s*:\s*(\w+)',
      'g'
    ) AS m
    LIMIT 1
  )), '');
$$;

CREATE OR REPLACE FUNCTION search_tag_filter(p_query text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(lower((
    SELECT coalesce(m[1], m[2])
    FROM regexp_matches(
      search_clean_query(p_query),
      '(?i)(?:\mtag\s*:\s*([\w.+#-]+)|#([\w.+-]+))',
      'g'
    ) AS m
    LIMIT 1
  )), '');
$$;

-- Normalize kind aliases from user input.
CREATE OR REPLACE FUNCTION search_normalize_kind(p_kind text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(p_kind, ''))
    WHEN 'project' THEN 'project'
    WHEN 'projects' THEN 'project'
    WHEN 'work' THEN 'project'
    WHEN 'experience' THEN 'experience'
    WHEN 'job' THEN 'experience'
    WHEN 'jobs' THEN 'experience'
    WHEN 'exp' THEN 'experience'
    WHEN 'stack' THEN 'stack'
    WHEN 'skills' THEN 'stack'
    WHEN 'skill' THEN 'stack'
    WHEN 'tech' THEN 'stack'
    WHEN 'tools' THEN 'stack'
    WHEN 'blog' THEN 'blog'
    WHEN 'blogs' THEN 'blog'
    WHEN 'post' THEN 'blog'
    WHEN 'posts' THEN 'blog'
    WHEN 'article' THEN 'blog'
    WHEN 'gallery' THEN 'gallery'
    WHEN 'photo' THEN 'gallery'
    WHEN 'photos' THEN 'gallery'
    WHEN 'image' THEN 'gallery'
    WHEN 'images' THEN 'gallery'
    WHEN 'resume' THEN 'resume'
    WHEN 'cv' THEN 'resume'
    ELSE NULL
  END;
$$;

-- Light synonym expansion so casual wording still hits content.
CREATE OR REPLACE FUNCTION search_expand_synonyms(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both FROM concat_ws(
    ' ',
    p_text,
    CASE WHEN p_text ~* '\mjs\M' OR p_text ~* '\mjavascript\M' THEN 'javascript js' END,
    CASE WHEN p_text ~* '\mts\M' OR p_text ~* '\mtypescript\M' THEN 'typescript ts' END,
    CASE WHEN p_text ~* '\mreact\M' OR p_text ~* '\mreactjs\M' THEN 'react reactjs' END,
    CASE WHEN p_text ~* '\mnext\M' OR p_text ~* '\mnextjs\M' THEN 'next nextjs' END,
    CASE WHEN p_text ~* '\mnode\M' OR p_text ~* '\mnodejs\M' THEN 'node nodejs' END,
    CASE WHEN p_text ~* '\mpy\M' OR p_text ~* '\mpython\M' THEN 'python py' END,
    CASE WHEN p_text ~* '\mdb\M' OR p_text ~* '\mdatabase\M' THEN 'database db sql' END,
    CASE WHEN p_text ~* '\mui\M' OR p_text ~* '\mux\M' THEN 'ui ux design interface' END,
    CASE WHEN p_text ~* '\mml\M' OR p_text ~* '\mai\M' THEN 'ai ml machine learning' END,
    CASE WHEN p_text ~* '\mfullstack\M' OR p_text ~* '\mfull-stack\M' THEN 'fullstack full-stack full stack' END,
    CASE WHEN p_text ~* '\mfrontend\M' OR p_text ~* '\mfront-end\M' THEN 'frontend front-end front end' END,
    CASE WHEN p_text ~* '\mbackend\M' OR p_text ~* '\mback-end\M' THEN 'backend back-end back end' END
  ));
$$;

-- Build a tsquery that understands web-search syntax; fall back safely.
CREATE OR REPLACE FUNCTION search_to_tsquery(p_text text)
RETURNS tsquery
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_text text := search_expand_synonyms(search_free_text(p_text));
  v_q tsquery;
BEGIN
  IF v_text IS NULL OR length(v_text) = 0 THEN
    RETURN NULL;
  END IF;

  BEGIN
    v_q := websearch_to_tsquery('english', v_text);
  EXCEPTION WHEN OTHERS THEN
    v_q := NULL;
  END;

  IF v_q IS NULL OR v_q = ''::tsquery THEN
    BEGIN
      v_q := plainto_tsquery('english', v_text);
    EXCEPTION WHEN OTHERS THEN
      v_q := NULL;
    END;
  END IF;

  RETURN v_q;
END;
$$;

-- Prefix query: "rea nex" → rea:* & nex:*  (helps while typing / partial words)
CREATE OR REPLACE FUNCTION search_to_prefix_tsquery(p_text text)
RETURNS tsquery
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_text text := search_free_text(p_text);
  v_parts text[];
  v_built text := '';
  v_tok text;
  v_q tsquery;
BEGIN
  IF v_text IS NULL OR length(v_text) = 0 THEN
    RETURN NULL;
  END IF;

  -- Drop quoted phrases / operators for prefix mode; keep bare words.
  v_text := regexp_replace(v_text, '"[^"]*"', ' ', 'g');
  v_text := regexp_replace(v_text, '(?i)\m(or|and|not)\M', ' ', 'g');
  v_text := regexp_replace(v_text, '[|&!()<>:'']', ' ', 'g');
  v_text := regexp_replace(v_text, '\s+', ' ', 'g');
  v_parts := regexp_split_to_array(trim(v_text), '\s+');

  FOREACH v_tok IN ARRAY v_parts LOOP
    IF v_tok ~ '^-' THEN
      CONTINUE;
    END IF;
    v_tok := regexp_replace(lower(v_tok), '[^a-z0-9_+.-]', '', 'g');
    IF length(v_tok) < 2 THEN
      CONTINUE;
    END IF;
    IF v_built <> '' THEN
      v_built := v_built || ' & ';
    END IF;
    v_built := v_built || v_tok || ':*';
  END LOOP;

  IF v_built = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    v_q := to_tsquery('english', v_built);
  EXCEPTION WHEN OTHERS THEN
    v_q := NULL;
  END;

  RETURN v_q;
END;
$$;

CREATE OR REPLACE FUNCTION search_kind_allowed(p_kind text, p_filter text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_filter IS NULL OR p_kind = search_normalize_kind(p_filter);
$$;

CREATE OR REPLACE FUNCTION search_has_tag(p_tags text[], p_tag text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_tag IS NULL
    OR EXISTS (
      SELECT 1
      FROM unnest(coalesce(p_tags, ARRAY[]::text[])) t
      WHERE lower(t) = lower(p_tag)
         OR lower(t) LIKE '%' || lower(p_tag) || '%'
    );
$$;

-- ---------------------------------------------------------------------------
-- Main RPC
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS search_all(text, integer, integer);

CREATE OR REPLACE FUNCTION search_all(
  p_query text,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  kind text,
  id text,
  title text,
  summary text,
  href text
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT
      search_clean_query(p_query) AS raw_q,
      search_free_text(p_query) AS free_q,
      search_kind_filter(p_query) AS kind_f,
      search_tag_filter(p_query) AS tag_f,
      search_to_tsquery(p_query) AS tsq,
      search_to_prefix_tsquery(p_query) AS prefix_tsq
  ),
  project_hits AS (
    SELECT
      'project'::text AS kind,
      p.id::text AS id,
      p.title,
      left(coalesce(p.description, ''), 240) AS summary,
      '/projects/' || p.id::text AS href,
      (
        setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
        setweight(to_tsvector('english', array_to_string(coalesce(p.tags, ARRAY[]::text[]), ' ')), 'B') ||
        setweight(to_tsvector('english', coalesce(p.category, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(p.description, '')), 'C') ||
        setweight(
          to_tsvector(
            'english',
            coalesce(p.details_md, '') || ' ' ||
            coalesce(p.github_url, '') || ' ' ||
            coalesce(p.live_url, '') || ' ' ||
            coalesce(p.links::text, '')
          ),
          'D'
        )
      ) AS document,
      lower(coalesce(p.title, '')) AS title_l,
      lower(
        coalesce(p.title, '') || ' ' ||
        coalesce(p.description, '') || ' ' ||
        array_to_string(coalesce(p.tags, ARRAY[]::text[]), ' ') || ' ' ||
        coalesce(p.category, '')
      ) AS haystack,
      p.tags AS tags
    FROM projects p
  ),
  experience_hits AS (
    SELECT
      'experience'::text AS kind,
      e.id::text AS id,
      e.title,
      left(coalesce(e.description, e.company, ''), 240) AS summary,
      '/experience/' || e.id::text AS href,
      (
        setweight(to_tsvector('english', coalesce(e.title, '') || ' ' || coalesce(e.role, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(e.company, '') || ' ' || coalesce(e.location, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(coalesce(e.tags, ARRAY[]::text[]), ' ')), 'B') ||
        setweight(to_tsvector('english', coalesce(e.description, '')), 'C') ||
        setweight(
          to_tsvector(
            'english',
            array_to_string(coalesce(e.highlights, ARRAY[]::text[]), ' ') || ' ' ||
            array_to_string(coalesce(e.challenges, ARRAY[]::text[]), ' ') || ' ' ||
            array_to_string(coalesce(e.learnings, ARRAY[]::text[]), ' ') || ' ' ||
            coalesce(e.development_summary, '') || ' ' ||
            coalesce(e.details_md, '')
          ),
          'D'
        )
      ) AS document,
      lower(coalesce(e.title, '')) AS title_l,
      lower(
        coalesce(e.title, '') || ' ' ||
        coalesce(e.role, '') || ' ' ||
        coalesce(e.company, '') || ' ' ||
        coalesce(e.description, '') || ' ' ||
        array_to_string(coalesce(e.tags, ARRAY[]::text[]), ' ')
      ) AS haystack,
      e.tags AS tags
    FROM experience e
  ),
  stack_hits AS (
    SELECT
      'stack'::text AS kind,
      s.id::text AS id,
      s.category AS title,
      left(coalesce(s.tools, s.description, ''), 240) AS summary,
      '/stack/' || s.id::text AS href,
      (
        setweight(to_tsvector('english', coalesce(s.category, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(s.tools, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(s.description, '')), 'C')
      ) AS document,
      lower(coalesce(s.category, '')) AS title_l,
      lower(
        coalesce(s.category, '') || ' ' ||
        coalesce(s.tools, '') || ' ' ||
        coalesce(s.description, '')
      ) AS haystack,
      string_to_array(regexp_replace(coalesce(s.tools, ''), '\s*,\s*', ',', 'g'), ',') AS tags
    FROM stack s
  ),
  blog_hits AS (
    SELECT
      'blog'::text AS kind,
      b.id::text AS id,
      b.title,
      left(coalesce(b.excerpt, ''), 240) AS summary,
      '/blog/' || b.id::text AS href,
      (
        setweight(to_tsvector('english', coalesce(b.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(b.category, '') || ' ' || array_to_string(coalesce(b.tags, ARRAY[]::text[]), ' ')), 'B') ||
        setweight(to_tsvector('english', coalesce(b.excerpt, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(b.body, '')), 'D')
      ) AS document,
      lower(coalesce(b.title, '')) AS title_l,
      lower(
        coalesce(b.title, '') || ' ' ||
        coalesce(b.excerpt, '') || ' ' ||
        coalesce(b.category, '') || ' ' ||
        array_to_string(coalesce(b.tags, ARRAY[]::text[]), ' ')
      ) AS haystack,
      b.tags AS tags
    FROM blog_posts b
  ),
  resume_hits AS (
    SELECT
      'resume'::text AS kind,
      'resume'::text AS id,
      'Resume'::text AS title,
      'Matches in resume'::text AS summary,
      '/resume'::text AS href,
      setweight(to_tsvector('english', coalesce(r.body_md, '')), 'B') AS document,
      'resume'::text AS title_l,
      lower(coalesce(r.body_md, '')) AS haystack,
      ARRAY[]::text[] AS tags
    FROM resume r
  ),
  gallery_hits AS (
    SELECT
      'gallery'::text AS kind,
      g.id::text AS id,
      g.title,
      left(coalesce(g.subtitle, ''), 240) AS summary,
      '/gallery/' || g.id::text AS href,
      (
        setweight(to_tsvector('english', coalesce(g.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(g.subtitle, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(g.details_md, '') || ' ' || coalesce(g.project_srcs::text, '')), 'D')
      ) AS document,
      lower(coalesce(g.title, '')) AS title_l,
      lower(
        coalesce(g.title, '') || ' ' ||
        coalesce(g.subtitle, '') || ' ' ||
        coalesce(g.details_md, '')
      ) AS haystack,
      ARRAY[]::text[] AS tags
    FROM gallery g
  ),
  corpus AS (
    SELECT * FROM project_hits
    UNION ALL SELECT * FROM experience_hits
    UNION ALL SELECT * FROM stack_hits
    UNION ALL SELECT * FROM blog_hits
    UNION ALL SELECT * FROM resume_hits
    UNION ALL SELECT * FROM gallery_hits
  ),
  scored AS (
    SELECT
      c.kind,
      c.id,
      c.title,
      c.summary,
      c.href,
      (
        CASE
          -- Filter-only queries (kind:blog / tag:react) still rank somehow
          WHEN coalesce(p.free_q, '') = '' THEN 0.15
          ELSE 0
        END
        + COALESCE(ts_rank_cd(c.document, p.tsq), 0) * 1.0
        + COALESCE(ts_rank_cd(c.document, p.prefix_tsq), 0) * 0.85
        + CASE
            WHEN p.free_q <> '' AND c.title_l = lower(p.free_q) THEN 2.5
            WHEN p.free_q <> '' AND c.title_l LIKE lower(p.free_q) || '%' THEN 1.4
            WHEN p.free_q <> '' AND c.title_l LIKE '%' || lower(p.free_q) || '%' THEN 0.9
            ELSE 0
          END
        + CASE
            WHEN length(p.free_q) >= 2
              THEN least(1.2, similarity(c.title_l, lower(p.free_q)) * 1.6)
            ELSE 0
          END
        + CASE
            WHEN length(p.free_q) >= 3
              THEN least(0.6, similarity(c.haystack, lower(p.free_q)) * 0.8)
            ELSE 0
          END
      )::float8 AS rank,
      (
        -- Filter-only: kind: and/or tag: with no free text
        (coalesce(p.free_q, '') = '' AND (p.kind_f IS NOT NULL OR p.tag_f IS NOT NULL))
        OR (p.tsq IS NOT NULL AND c.document @@ p.tsq)
        OR (p.prefix_tsq IS NOT NULL AND c.document @@ p.prefix_tsq)
        OR (
          length(p.free_q) >= 2
          AND (
            c.title_l LIKE '%' || lower(p.free_q) || '%'
            OR c.haystack LIKE '%' || lower(p.free_q) || '%'
            OR similarity(c.title_l, lower(p.free_q)) >= 0.35
            OR (length(p.free_q) >= 4 AND similarity(c.haystack, lower(p.free_q)) >= 0.18)
          )
        )
        OR (
          -- Every meaningful token must hit title/body (substring or stem)
          coalesce(p.free_q, '') <> ''
          AND (
            SELECT bool_and(
              length(tok) < 2
              OR c.haystack LIKE '%' || tok || '%'
              OR c.document @@ plainto_tsquery('english', tok)
            )
            FROM unnest(
              regexp_split_to_array(
                lower(regexp_replace(p.free_q, '[^\w\s.+#-]', ' ', 'g')),
                '\s+'
              )
            ) AS tok
          )
        )
      ) AS matched
    FROM corpus c
    CROSS JOIN params p
    WHERE p.raw_q <> ''
      AND search_kind_allowed(c.kind, p.kind_f)
      AND search_has_tag(c.tags, p.tag_f)
  )
  SELECT s.kind, s.id, s.title, s.summary, s.href
  FROM scored s
  WHERE s.matched AND s.rank > 0
  ORDER BY s.rank DESC, s.kind, s.title
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

COMMENT ON FUNCTION search_all(text, integer, integer) IS
  'Advanced portfolio search: websearch syntax, prefixes, kind/tag filters, synonyms, trigram fallback.';
