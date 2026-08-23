# AGENTS.md — Al-Ghunaimi Law Firm Website

## Stack
Vanilla static site (no build, no package manager, no framework) + Vercel Serverless APIs.
Open `index.html` directly for static preview; `vercel dev` for API.

## Production Source of Truth
- **GitHub:** `BLAL1111/Al-Ghunaimi-Law-Firm` branch `main`
- **Hosting:** `https://al-ghunaimi-law-firm.vercel.app/` (canonical)
- **DB/Auth/Storage:** Supabase
- **Lead Store:** Upstash Redis
- **Fallback:** `data/articles.json` + `data/snapshot-meta.json` (GitHub snapshot)

## Files (public)
- `index.html` (481 lines) — hero, stats, about preview, why-us, services, team, articles preview (3 latest), location, CTA
- `about.html` / `contact.html` / `booking.html` / `services.html` / `services/*.html`
- `articles.html` (433 lines) — hub + search + filter; merges Supabase + `data/articles.json` + static 6 — deduped by slug
- `articles/view.html` (222 lines) — detail page; rewrite target for `/articles/:slug`; failover: Supabase (published + redirects) → `data/articles.json` → error
- `styles.css` (~1265 lines) — dark/light via `[data-theme]`, RTL via `[dir]`, CSS custom properties
- `script.js` (256 lines) — i18n toggle, theme toggle (`ghonemy_theme`), mobile drawer ≤992px, canvas, booking→WhatsApp
- `translations.js` (374 lines) — global `translations` with `ar`/`en`/`fr`, `data-i18n`
- `components.js` / `search.js` — navbar/footer injection, client article search

## JS Modules
- `js/supabase-config.js` — `window.SUPABASE_CONFIG` (url + `sb_publishable_...`), optional localStorage override
- `js/supabase.js` — `window.GhonemySupabase.createClient()` wrapper (reads config or meta tags)
- `js/lead.js` — Lead Attribution: `GH-XXXXXX`, fetch `/api/lead`, fallback ID, WhatsApp open, toast

## Admin (noindex)
- `admin/login.html` — Supabase Auth + `admin_users` check, forgot password
- `admin/articles.html` — list/search/filter, publish/unpublish/archive/delete, health (Supabase/Snapshot/Lead), `Sync Snapshot`
- `admin/editor.html` — create/edit, slug validation `^[a-z0-9]+(?:-[a-z0-9]+)*$`, tags, DOMPurify, cover upload to `article-images` bucket, SEO, preview
- `admin/leads.html` — table from `/api/leads` (Upstash), health

## API (Vercel Serverless, `api/`)
- `lead.js` — POST `{conversion_type,landing_path}` → generate `GH-` id, dedup 5min by IP+UA, store `lead:<id>` hash (90d) + `leads:by_date` zset in Upstash, always returns `lead_id` + `whatsapp_text` (failopen)
- `leads.js` — GET (auth: `Authorization: Bearer <supabase_jwt>`) → verify admin via Supabase `admin_users`, return latest 50 from Upstash
- `publish-article.js` — POST admin JWT → verify admin, upsert article into `data/articles.json` via GitHub Contents API (needs `GITHUB_TOKEN`)
- `sync-snapshot.js` — POST admin JWT → export all `status=published` from Supabase → commit `data/articles.json` (legacy array) + `data/snapshot-meta.json` to GitHub
- `sitemap.js` — GET `https://.../sitemap.xml` → static URLs + Supabase published slugs (published only), `Cache-Control: s-maxage=3600`

## Data / Snapshot
- `data/articles.json` — legacy array fallback; must contain `content_html` + cover/seo fields for full render when Supabase down
- `data/snapshot-meta.json` — `{snapshot_version, snapshot_generated_at, article_count, last_sync_status}`
- `supabase/schema.sql` — `admin_users`, `articles` (RLS: anon/auth can read `published` only; admin via `admin_users`), `article_redirects`, `updated_at` trigger
- `supabase/migrate-articles.js` — optional seed

## Config
- `vercel.json` — `cleanUrls`, `redirects` (old `.html` slugs → clean), `rewrites` (`/articles/:slug` → `/articles/view.html`, `/sitemap.xml` → `/api/sitemap`), `headers` (nosniff, DENY, strict-origin-when-cross-origin, no camera/mic/geo; `/admin/*` noindex; cache for img/css/js)
- `opencode.json` — Playwright MCP enabled
- `robots.txt` + `sitemap.xml` (static file → rewritten to API)

## Conventions
- **Language**: Arabic default `dir="rtl"`. EN/FR `dir="ltr"`. Keys via `data-i18n`, persisted `ghonemy_lang`.
- **Theme**: Dark default, `data-theme` on `<html>`, persisted `ghonemy_theme`.
- **Booking/WhatsApp**: `+20 112 611 8276` via `wa.me`, no backend; lead attribution appends `رمز طلب الموقع: GH-...`
- **Mobile drawer**: Collapses at **≤992px**.
- **Script order**: `translations.js` before `script.js`; `supabase-config.js` before `supabase.js` before page script.
- **Font Awesome**: `media="print"` + `onload="this.media='all'"` non-blocking.
- **CDNs**: Google Fonts (`Cairo`/`Amiri`/`Cinzel`/`Plus Jakarta Sans`) via `preconnect`; Supabase JS v2 + DOMPurify v3 via jsdelivr.

## SEO
- Canonical `https://al-ghunaimi-law-firm.vercel.app/` (not `alghonemy-law.com`, not `al-ghoneimy-law-team`)
- Every public page: `title`, `meta description`, `canonical`, `og:*`, `twitter:*` as needed, `hreflang` on hub, JSON-LD `LegalService` (home) / `Article` (detail)
- Admin: `noindex,nofollow` + `X-Robots-Tag: noindex, nofollow`
- Old `.html` article URLs 301 → clean `/articles/<slug>`

## Style
- Gold accent: `#D4AF37` (dark), `#B8860B` (light)
- Fonts: `Cairo`/`Amiri` (arabic), `Cinzel`/`Plus Jakarta Sans` (latin) — Google Fonts + FA6
- No external CSS framework; breakpoints: 1250,1200,1100,1024,992,768,480,360 (+ 414/390/375/320 tested manually)
- Below-fold sections use `content-visibility: auto`; images explicit `width`/`height` + `loading="lazy"`; no inline styles except critical; canvas pauses via `IntersectionObserver`

## Navbar
- Single `<li.nav-actions-li>` inside `<ul.nav-menu>` — desktop: `flex-shrink:0` (right); mobile: `margin-top:auto` (drawer bottom)
- 6 nav links wrapped in `<li.nav-links-item>` → `<ul.nav-link-list>` — desktop `flex:1; justify-content:center`; mobile column
- Theme toggle uses FA `fa-sun`/`fa-moon`, swapped by `initTheme()` in `script.js`

## Env Vars (Vercel only, never commit)
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `GITHUB_TOKEN`, `GITHUB_REPO` (default `BLAL1111/Al-Ghunaimi-Law-Firm`), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Critical Flows — do not break
- **Article detail**: `/articles/<slug>` → Vercel rewrite → `articles/view.html` → `getSlug()` → Supabase `articles.status=published` → `article_redirects` → `data/articles.json` → error. Related = same category limit 2.
- **Article hub/home**: merge order Supabase → `data/articles.json` → static 6, dedup slug, sort `published_at` desc.
- **Lead**: click `wa.me` → `js/lead.js` `POST /api/lead` → Upstash hash+zset (or fallback ID) → `window.open(wa.me/?text=رمز...)` + toast. Booking form uses `window.GhonemyLead.createLead`.
- **Admin publish**: Supabase insert/update → optional `POST /api/publish-article` → GitHub `data/articles.json` (full fields including `content_html`) → Vercel redeploy. `Sync Snapshot` exports all published.

## Known Pitfalls (fixed 2026-08)
- `admin/articles.html` early-return on 0 articles skipped `Sync Snapshot` listener & `checkHealth()` → moved outside `render()`.
- `logout` without `try/catch` failed when CDN missing → now always navigates + clears storage.
- `admin/editor.html` used undefined `supabase` instead of `supabaseClient`.
- `api/publish-article.js` previously saved only title/slug/excerpt → now saves full `content_html` + SEO/cover fields for fallback.
