-- Add optional markdown "more details" to gallery. Not returned by list/selected
-- so it is only loaded on the dynamic gallery detail page.
--
-- Run this in the Supabase SQL Editor. If your `gallery.id` is type uuid (not text),
-- the id uuid below is fine; if it's text already, change id to text.

-- 1. Add the new column (nullable; existing rows stay null)
ALTER TABLE gallery
  ADD COLUMN IF NOT EXISTS details_md text;

-- 2. List RPCs: return only columns needed for cards/lists (exclude details_md).
--    Must DROP first because PostgreSQL does not allow changing return type with CREATE OR REPLACE.

DROP FUNCTION IF EXISTS get_gallery(integer, integer);
DROP FUNCTION IF EXISTS get_selected_gallery(integer, integer);

-- get_gallery: paginated list for gallery index (no details_md)
CREATE FUNCTION get_gallery(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  title text,
  subtitle text,
  src text,
  tone text,
  project_srcs jsonb
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
    g.project_srcs
  FROM gallery g
  ORDER BY g.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

-- get_selected_gallery: only gallery items in selected_items (table_name = 'gallery').
CREATE FUNCTION get_selected_gallery(p_limit int DEFAULT 4, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  title text,
  subtitle text,
  src text,
  tone text,
  project_srcs jsonb
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
    g.project_srcs
  FROM gallery g
  INNER JOIN selected_items si ON si.table_name = 'gallery' AND si.item_id = g.id
  ORDER BY si.created_at, g.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

