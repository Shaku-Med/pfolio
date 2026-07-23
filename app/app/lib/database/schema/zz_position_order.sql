-- Manual display order for content tables.
-- Run in the Supabase SQL Editor after prior schema migrations.
--
-- Adds "position" (0-based, lower = earlier) and switches list RPCs
-- to ORDER BY "position" ASC instead of period / date / title / id.
-- Note: "position" is reserved in PostgreSQL — always quote the identifier.

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS "position" integer;

ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS "position" integer;

ALTER TABLE public.stack
  ADD COLUMN IF NOT EXISTS "position" integer;

ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS "position" integer;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS "position" integer;

-- ---------------------------------------------------------------------------
-- 2. Backfill from previous sort rules (only where position is still null)
-- ---------------------------------------------------------------------------

WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY date DESC NULLS LAST, id) - 1)::integer AS pos
  FROM public.projects
)
UPDATE public.projects p
SET "position" = o.pos
FROM ordered o
WHERE p.id = o.id AND p."position" IS NULL;

WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY (period->>'from') DESC NULLS LAST, id) - 1)::integer AS pos
  FROM public.experience
)
UPDATE public.experience e
SET "position" = o.pos
FROM ordered o
WHERE e.id = o.id AND e."position" IS NULL;

WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY category, id) - 1)::integer AS pos
  FROM public.stack
)
UPDATE public.stack s
SET "position" = o.pos
FROM ordered o
WHERE s.id = o.id AND s."position" IS NULL;

WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY id) - 1)::integer AS pos
  FROM public.gallery
)
UPDATE public.gallery g
SET "position" = o.pos
FROM ordered o
WHERE g.id = o.id AND g."position" IS NULL;

WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY date DESC NULLS LAST, id) - 1)::integer AS pos
  FROM public.blog_posts
)
UPDATE public.blog_posts b
SET "position" = o.pos
FROM ordered o
WHERE b.id = o.id AND b."position" IS NULL;

UPDATE public.projects SET "position" = 0 WHERE "position" IS NULL;
UPDATE public.experience SET "position" = 0 WHERE "position" IS NULL;
UPDATE public.stack SET "position" = 0 WHERE "position" IS NULL;
UPDATE public.gallery SET "position" = 0 WHERE "position" IS NULL;
UPDATE public.blog_posts SET "position" = 0 WHERE "position" IS NULL;

ALTER TABLE public.projects
  ALTER COLUMN "position" SET DEFAULT 0,
  ALTER COLUMN "position" SET NOT NULL;

ALTER TABLE public.experience
  ALTER COLUMN "position" SET DEFAULT 0,
  ALTER COLUMN "position" SET NOT NULL;

ALTER TABLE public.stack
  ALTER COLUMN "position" SET DEFAULT 0,
  ALTER COLUMN "position" SET NOT NULL;

ALTER TABLE public.gallery
  ALTER COLUMN "position" SET DEFAULT 0,
  ALTER COLUMN "position" SET NOT NULL;

ALTER TABLE public.blog_posts
  ALTER COLUMN "position" SET DEFAULT 0,
  ALTER COLUMN "position" SET NOT NULL;

CREATE INDEX IF NOT EXISTS projects_position_idx ON public.projects ("position", id);
CREATE INDEX IF NOT EXISTS experience_position_idx ON public.experience ("position", id);
CREATE INDEX IF NOT EXISTS stack_position_idx ON public.stack ("position", id);
CREATE INDEX IF NOT EXISTS gallery_position_idx ON public.gallery ("position", id);
CREATE INDEX IF NOT EXISTS blog_posts_position_idx ON public.blog_posts ("position", id);

-- ---------------------------------------------------------------------------
-- 3. List RPCs — order by position
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS get_projects(integer, integer);
DROP FUNCTION IF EXISTS get_selected_projects(integer, integer);
DROP FUNCTION IF EXISTS get_experience(integer, integer);
DROP FUNCTION IF EXISTS get_stack(integer, integer);
DROP FUNCTION IF EXISTS get_selected_stack(integer, integer);
DROP FUNCTION IF EXISTS get_gallery(integer, integer);
DROP FUNCTION IF EXISTS get_selected_gallery(integer, integer);
DROP FUNCTION IF EXISTS get_blog_posts(integer, integer);
DROP FUNCTION IF EXISTS get_selected_blog(integer, integer);

CREATE FUNCTION get_projects(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  id text,
  category text,
  title text,
  description text,
  tags text[],
  image text,
  image_alt text,
  github_url text,
  live_url text,
  links jsonb,
  "position" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id::text,
    p.category,
    p.title,
    p.description,
    p.tags,
    p.image,
    p.image_alt,
    p.github_url,
    p.live_url,
    p.links,
    p."position"
  FROM projects p
  ORDER BY p."position" ASC, p.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_selected_projects(p_limit int DEFAULT 4, p_offset int DEFAULT 0)
RETURNS TABLE (
  id text,
  category text,
  title text,
  description text,
  tags text[],
  image text,
  image_alt text,
  github_url text,
  live_url text,
  links jsonb,
  "position" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id::text,
    p.category,
    p.title,
    p.description,
    p.tags,
    p.image,
    p.image_alt,
    p.github_url,
    p.live_url,
    p.links,
    p."position"
  FROM projects p
  INNER JOIN selected_items si ON si.table_name = 'projects' AND si.item_id = p.id
  ORDER BY p."position" ASC, p.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_experience(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  role text,
  title text,
  period jsonb,
  description text,
  company text,
  location text,
  logo text,
  highlights text[],
  tags text[],
  development_summary text,
  challenges text[],
  learnings text[],
  "position" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id,
    e.role,
    e.title,
    e.period,
    e.description,
    e.company,
    e.location,
    e.logo,
    e.highlights,
    e.tags,
    e.development_summary,
    e.challenges,
    e.learnings,
    e."position"
  FROM experience e
  ORDER BY e."position" ASC, e.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_stack(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS SETOF public.stack
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.stack
  ORDER BY "position" ASC, id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_selected_stack(p_limit int DEFAULT 4, p_offset int DEFAULT 0)
RETURNS SETOF public.stack
LANGUAGE sql
STABLE
AS $$
  SELECT s.*
  FROM public.stack s
  INNER JOIN selected_items si ON si.table_name = 'stack' AND si.item_id = s.id
  ORDER BY s."position" ASC, s.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_gallery(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  title text,
  subtitle text,
  src text,
  tone text,
  project_srcs jsonb,
  "position" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    g.id,
    g.title,
    g.subtitle,
    g.src,
    g.tone,
    g.project_srcs,
    g."position"
  FROM gallery g
  ORDER BY g."position" ASC, g.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_selected_gallery(p_limit int DEFAULT 4, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  title text,
  subtitle text,
  src text,
  tone text,
  project_srcs jsonb,
  "position" integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    g.id,
    g.title,
    g.subtitle,
    g.src,
    g.tone,
    g.project_srcs,
    g."position"
  FROM gallery g
  INNER JOIN selected_items si ON si.table_name = 'gallery' AND si.item_id = g.id
  ORDER BY g."position" ASC, g.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

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
  cover_image text,
  "position" integer
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
    b.date::text,
    b.read_time,
    b.tags,
    b.cover_image,
    b."position"
  FROM blog_posts b
  ORDER BY b."position" ASC, b.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

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
  cover_image text,
  "position" integer
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
    b.date::text,
    b.read_time,
    b.tags,
    b.cover_image,
    b."position"
  FROM blog_posts b
  INNER JOIN selected_items si ON si.table_name = 'blog_posts' AND si.item_id = b.id
  ORDER BY b."position" ASC, b.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;
