-- Add optional markdown "more details" to experience. Not returned by the list
-- function, so it is only loaded on the dynamic experience detail page.
--
-- Run this in the Supabase SQL Editor. If your `experience.id` is type uuid (not text),
-- the return type id uuid below is fine; if it's text already, you can change it.

-- 1. Add the new column (nullable; existing rows stay null)
ALTER TABLE experience
  ADD COLUMN IF NOT EXISTS details_md text;

-- 2. List RPC: return only columns needed for cards/lists (exclude details_md).
--    Must DROP first because PostgreSQL does not allow changing return type with CREATE OR REPLACE.

DROP FUNCTION IF EXISTS get_experience(integer, integer);

-- get_experience: paginated list for experience index (no details_md)
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
  learnings text[]
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
    e.learnings
  FROM experience e
  ORDER BY (e.period->>'from') DESC
  LIMIT NULLIF(greatest(0, p_limit), 0)
  OFFSET NULLIF(greatest(0, p_offset), 0);
$$;