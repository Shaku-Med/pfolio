create table if not exists public.selected_items (
  id uuid primary key default gen_random_uuid(),
  table_name text not null check (table_name in ('projects','stack','blog_posts','gallery')),
  item_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.selected_items enable row level security;

drop policy if exists "selected_items_select" on public.selected_items;
create policy "selected_items_select" on public.selected_items
  for select using (true);

create or replace function public.get_selected_projects(
  p_limit integer default 4,
  p_offset integer default 0
)
returns setof public.projects
language sql
as $$
  select p.*
  from public.selected_items s
  join public.projects p on p.id = s.item_id
  where s.table_name = 'projects'
  order by s.created_at
  limit p_limit offset p_offset;
$$;

create or replace function public.get_selected_stack(
  p_limit integer default 4,
  p_offset integer default 0
)
returns setof public.stack
language sql
as $$
  select st.*
  from public.selected_items s
  join public.stack st on st.id = s.item_id
  where s.table_name = 'stack'
  order by s.created_at
  limit p_limit offset p_offset;
$$;

create or replace function public.get_selected_blog(
  p_limit integer default 4,
  p_offset integer default 0
)
returns setof public.blog_posts
language sql
as $$
  select b.*
  from public.selected_items s
  join public.blog_posts b on b.id = s.item_id
  where s.table_name = 'blog_posts'
  order by s.created_at
  limit p_limit offset p_offset;
$$;

create or replace function public.get_selected_gallery(
  p_limit integer default 4,
  p_offset integer default 0
)
returns setof public.gallery
language sql
as $$
  select g.*
  from public.selected_items s
  join public.gallery g on g.id = s.item_id
  where s.table_name = 'gallery'
  order by s.created_at
  limit p_limit offset p_offset;
$$;


