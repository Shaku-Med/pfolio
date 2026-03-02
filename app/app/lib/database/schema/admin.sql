create table if not exists public.admin (
  id uuid primary key default gen_random_uuid(),
  encrypted_password text not null,
  created_at timestamptz default now()
);

create or replace function block_multiple_admins()
returns trigger as $$
begin
  if (select count(*) from public.admin) >= 1 then
    raise exception 'Only one admin is allowed';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists enforce_single_admin on public.admin;
create trigger enforce_single_admin
before insert on public.admin
for each row execute function block_multiple_admins();

alter table public.admin enable row level security;

drop policy if exists "admin full access" on public.admin;
create policy "admin full access" on public.admin
for all using (true) with check (true);
