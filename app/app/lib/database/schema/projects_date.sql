-- Adds an optional date to projects so they can sit on the experience/projects
-- timeline. Rough dates are fine (e.g. '2023-06-01' for "around mid 2023").
-- Projects with a null date simply stay off the timeline until you fill it in.
--
-- Run this in the Supabase SQL Editor.

alter table public.projects
  add column if not exists date date;

-- List RPCs must be dropped first: their return type changes (date column added).
drop function if exists get_projects(integer, integer);
drop function if exists get_selected_projects(integer, integer);

create function get_projects(p_limit int default 20, p_offset int default 0)
returns table (
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
  date date
)
language sql
stable
as $$
  select
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
    p.date
  from projects p
  order by p.date desc nulls last, p.id
  limit nullif(greatest(0, p_limit), 0)
  offset nullif(greatest(0, p_offset), 0);
$$;

create function get_selected_projects(p_limit int default 4, p_offset int default 0)
returns table (
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
  date date
)
language sql
stable
as $$
  select
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
    p.date
  from projects p
  inner join selected_items si on si.table_name = 'projects' and si.item_id = p.id
  order by si.created_at, p.id
  limit nullif(greatest(0, p_limit), 0)
  offset nullif(greatest(0, p_offset), 0);
$$;

-- get_project_by_id returns "setof projects" so it picks up the new column automatically.
