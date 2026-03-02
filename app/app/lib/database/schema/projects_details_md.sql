-- Add optional markdown "more details" to projects. Not returned by list/selected
-- so it is only loaded on the dynamic project detail page.
--
-- Run this in the Supabase SQL Editor. If your `projects.id` is type uuid (not text),
-- change get_project_by_id parameter to p_id uuid and use "WHERE id = p_id".

-- 1. Add the new column (nullable; existing rows stay null)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS details_md text;

-- 2. List RPCs: return only columns needed for cards/lists (exclude details_md).
--    Must DROP first because PostgreSQL does not allow changing return type with CREATE OR REPLACE.

DROP FUNCTION IF EXISTS get_projects(integer, integer);
DROP FUNCTION IF EXISTS get_selected_projects(integer, integer);

-- get_projects: paginated list for projects index (no details_md)
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
  links jsonb
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.category,
    p.title,
    p.description,
    p.tags,
    p.image,
    p.image_alt,
    p.github_url,
    p.live_url,
    p.links
  FROM projects p
  ORDER BY p.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

-- get_selected_projects: only projects in selected_items (table_name = 'projects').
-- Returns no rows when there are no selected projects.
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
  links jsonb
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
    p.links
  FROM projects p
  INNER JOIN selected_items si ON si.table_name = 'projects' AND si.item_id = p.id
  ORDER BY si.created_at, p.id
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;

-- 3. Single project by id: returns full row including details_md (for dynamic project page only)
--    p_id is text so the app can call with a string; cast to uuid if projects.id is uuid.
CREATE OR REPLACE FUNCTION get_project_by_id(p_id text)
RETURNS SETOF projects
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM projects
  WHERE id = p_id::uuid
  LIMIT 1;
$$;
