create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  image text not null default '',
  image_alt text not null,
  github_url text,
  live_url text,
  links jsonb default '[]'
);

alter table public.projects enable row level security;

drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects
  for select using (true);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  title text not null,
  period jsonb not null,
  description text not null,
  company text,
  location text,
  logo text,
  highlights text[] default '{}',
  tags text[] default '{}',
  development_summary text,
  challenges text[] default '{}',
  learnings text[] default '{}'
);

alter table public.experience enable row level security;

drop policy if exists "experience_select" on public.experience;
create policy "experience_select" on public.experience
  for select using (true);

create table if not exists public.stack (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  tools text not null,
  description text not null
);

alter table public.stack enable row level security;

drop policy if exists "stack_select" on public.stack;
create policy "stack_select" on public.stack
  for select using (true);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  src text not null,
  tone text not null check (tone in ('dark', 'light'))
);

alter table public.gallery enable row level security;

drop policy if exists "gallery_select" on public.gallery;
create policy "gallery_select" on public.gallery
  for select using (true);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  excerpt text not null,
  date date not null,
  read_time text,
  tags text[] default '{}',
  cover_image text,
  body text not null
);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_select" on public.blog_posts;
create policy "blog_posts_select" on public.blog_posts
  for select using (true);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_insert" on public.contact_submissions;
create policy "contact_submissions_insert" on public.contact_submissions
  for insert with check (true);

drop policy if exists "contact_submissions_select" on public.contact_submissions;
create policy "contact_submissions_select" on public.contact_submissions
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create table if not exists public.contact (
  id text primary key default 'default',
  email text not null,
  phone text,
  links jsonb default '[]'
);

alter table public.contact enable row level security;

drop policy if exists "contact_select" on public.contact;
create policy "contact_select" on public.contact
  for select using (true);

alter table public.projects
  alter column image set default '';

update public.projects
  set image = ''
  where image is null;

create or replace function public.get_projects(p_limit integer default 20, p_offset integer default 0)
returns setof public.projects
language sql
as $$
  select *
  from public.projects
  order by title
  limit p_limit offset p_offset;
$$;

create or replace function public.get_experience(p_limit integer default 20, p_offset integer default 0)
returns setof public.experience
language sql
as $$
  select *
  from public.experience
  order by (period->>'from') desc, id
  limit p_limit offset p_offset;
$$;

create or replace function public.get_stack(p_limit integer default 20, p_offset integer default 0)
returns setof public.stack
language sql
as $$
  select *
  from public.stack
  order by category, id
  limit p_limit offset p_offset;
$$;

create or replace function public.get_gallery(p_limit integer default 20, p_offset integer default 0)
returns setof public.gallery
language sql
as $$
  select *
  from public.gallery
  order by title, id
  limit p_limit offset p_offset;
$$;

create or replace function public.get_blog_posts(p_limit integer default 20, p_offset integer default 0)
returns setof public.blog_posts
language sql
as $$
  select *
  from public.blog_posts
  order by date desc, id
  limit p_limit offset p_offset;
$$;

create or replace function public.get_contact()
returns setof public.contact
language sql
as $$
  select *
  from public.contact
  order by id
  limit 1;
$$;

create table if not exists public.resume (
  id text primary key default 'default',
  body_md text not null,
  updated_at timestamptz not null default now()
);

alter table public.resume enable row level security;

drop policy if exists "resume_select" on public.resume;
create policy "resume_select" on public.resume
  for select using (true);

create or replace function public.get_resume()
returns setof public.resume
language sql
as $$
  select *
  from public.resume
  order by id
  limit 1;
$$;
