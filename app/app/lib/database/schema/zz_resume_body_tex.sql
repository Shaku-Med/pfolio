-- Resume LaTeX source, uploaded from the admin CLI / GUI.
--
-- get_resume() is `select * from public.resume` returning `setof public.resume`,
-- so the new column flows through the RPC with no function change needed.
--
-- Safe to re-run.

alter table public.resume
  add column if not exists body_tex text;

comment on column public.resume.body_tex is
  'LaTeX source for the resume Source tab. Null falls back to RESUME_TEX_URL / the static /resumes/resume.tex.';
