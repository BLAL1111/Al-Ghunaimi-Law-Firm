-- Al-Ghunaimi Law Firm — Supabase Schema
-- Run in Supabase SQL Editor (single transaction)

-- Enable pgcrypto for gen_random_uuid if not exists
create extension if not exists "pgcrypto";

-- =========================================================
-- admin_users: maps auth.users -> admin role
-- =========================================================
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Only authenticated admin can read own row; anon cannot read
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "admin_users_no_anon" on public.admin_users;
create policy "admin_users_no_anon"
  on public.admin_users for select
  to anon
  using (false);

-- Only service_role can insert (via Dashboard or Edge Function)
-- No anon/authenticated insert directly — use service_role
drop policy if exists "admin_users_no_insert" on public.admin_users;
create policy "admin_users_no_insert"
  on public.admin_users for insert
  to authenticated, anon
  with check (false);

-- =========================================================
-- articles
-- =========================================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  content_html text not null,
  category text,
  tags text[] default '{}',
  cover_image_url text,
  cover_image_alt text,
  author_name text default 'مؤسسة الغنيمي للمحاماة',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text,
  seo_description text,
  og_image_url text,
  canonical_path text,
  related_service_slug text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  featured boolean not null default false
);

create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_published_at_idx on public.articles(published_at desc) where status = 'published';
create index if not exists articles_category_idx on public.articles(category);
create index if not exists articles_slug_idx on public.articles(slug);
create index if not exists articles_tags_idx on public.articles using gin(tags);

alter table public.articles enable row level security;

-- Public: can read only published
drop policy if exists "articles_public_select_published" on public.articles;
create policy "articles_public_select_published"
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

-- Admin: can do all if in admin_users
drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all"
  on public.articles for all
  to authenticated
  using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

-- =========================================================
-- article_redirects: old slug -> article
-- =========================================================
create table if not exists public.article_redirects (
  id uuid primary key default gen_random_uuid(),
  old_slug text unique not null,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.article_redirects enable row level security;

drop policy if exists "redirects_public_select" on public.article_redirects;
create policy "redirects_public_select"
  on public.article_redirects for select
  to anon, authenticated
  using (true);

drop policy if exists "redirects_admin_all" on public.article_redirects;
create policy "redirects_admin_all"
  on public.article_redirects for all
  to authenticated
  using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

-- =========================================================
-- updated_at trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- =========================================================
-- Storage bucket for article-images (create via Dashboard > Storage)
-- Bucket name: article-images (public read, admin write)
-- Policies to be set in Storage > Policies (see SUPABASE_SETUP.md)
-- =========================================================
