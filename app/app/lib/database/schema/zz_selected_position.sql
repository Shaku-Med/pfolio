-- Selected / featured items: independent display order for home teasers.
-- Run in Supabase SQL Editor after zz_position_order.sql.
--
-- Adds "position" on selected_items (per table_name), unique membership,
-- and switches get_selected_* to ORDER BY si."position".

ALTER TABLE public.selected_items
  ADD COLUMN IF NOT EXISTS "position" integer;

-- Backfill per table_name from previous created_at order
WITH ordered AS (
  SELECT
    id,
    (ROW_NUMBER() OVER (PARTITION BY table_name ORDER BY created_at ASC, id) - 1)::integer AS pos
  FROM public.selected_items
)
UPDATE public.selected_items s
SET "position" = o.pos
FROM ordered o
WHERE s.id = o.id AND s."position" IS NULL;

UPDATE public.selected_items SET "position" = 0 WHERE "position" IS NULL;

ALTER TABLE public.selected_items
  ALTER COLUMN "position" SET DEFAULT 0,
  ALTER COLUMN "position" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS selected_items_table_item_uidx
  ON public.selected_items (table_name, item_id);

CREATE INDEX IF NOT EXISTS selected_items_table_position_idx
  ON public.selected_items (table_name, "position", id);

-- ---------------------------------------------------------------------------
-- RPCs — order by selection position (not catalog position)
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS get_selected_projects(integer, integer);
DROP FUNCTION IF EXISTS get_selected_stack(integer, integer);
DROP FUNCTION IF EXISTS get_selected_gallery(integer, integer);
DROP FUNCTION IF EXISTS get_selected_blog(integer, integer);

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
    si."position"
  FROM selected_items si
  INNER JOIN projects p ON p.id::text = si.item_id::text
  WHERE si.table_name = 'projects'
  ORDER BY si."position" ASC, si.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

CREATE FUNCTION get_selected_stack(p_limit int DEFAULT 4, p_offset int DEFAULT 0)
RETURNS SETOF public.stack
LANGUAGE sql
STABLE
AS $$
  SELECT s.*
  FROM selected_items si
  INNER JOIN public.stack s ON s.id = si.item_id
  WHERE si.table_name = 'stack'
  ORDER BY si."position" ASC, si.id
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
    si."position"
  FROM selected_items si
  INNER JOIN gallery g ON g.id = si.item_id
  WHERE si.table_name = 'gallery'
  ORDER BY si."position" ASC, si.id
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
    si."position"
  FROM selected_items si
  INNER JOIN blog_posts b ON b.id = si.item_id
  WHERE si.table_name = 'blog_posts'
  ORDER BY si."position" ASC, si.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;
