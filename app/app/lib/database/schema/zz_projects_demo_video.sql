-- Optional short demo clip for a project, shown as the cover on its page.
-- Either a path in the image repo (07_23_2026/<id>/demo.mp4) or a direct
-- https link to an .mp4 or .webm file.
--
-- get_project_by_id returns "setof projects", so it picks this up on its own.
-- Run this in the Supabase SQL Editor.

alter table public.projects
  add column if not exists demo_video text;

alter table public.projects
  drop constraint if exists projects_demo_video_check;

alter table public.projects
  add constraint projects_demo_video_check check (
    demo_video is null
    or (
      char_length(demo_video) <= 512
      and demo_video ~* '\.(mp4|webm)$'
      and demo_video !~ '\.\.'
      and (demo_video ~* '^https://' or demo_video !~* '^[a-z]+:')
    )
  );
