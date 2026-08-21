# Supabase Setup — Al-Ghunaimi Law Firm

## 1. Create Project
1. Go to https://supabase.com/dashboard → New project
2. Region: closest to Egypt (e.g. eu-central-1)
3. Note `Project URL` and `Publishable Key` (anon) from Settings > API

## 2. Environment Variables

### Vercel (Production)
Vercel Dashboard > Project > Settings > Environment Variables

| Name | Value | Where to find |
|------|-------|---------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase > Settings > API > Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | `eyJ...` | Supabase > Settings > API > Publishable key (anon) |
| `SUPABASE_SECRET_KEY` | `eyJ...` (service_role) | Only if you add server-side functions — **never expose to browser** |

Add to **Production** and **Preview** (and Redeploy).

### Local (for migration script)
Create `.env` in project root (gitignored, never commit):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJ...service_role...
```

## 3. Run schema.sql
Supabase Dashboard > SQL Editor > New query → paste `supabase/schema.sql` → Run.

Verify:
- `admin_users`, `articles`, `article_redirects` exist
- RLS enabled (green shield)

## 4. Create Storage bucket (if you need cover images)
Storage > New bucket → `article-images` → Public: **yes** (public read)
Then Storage > Policies > `article-images`:
- `SELECT` for `anon, authenticated` where `bucket_id = 'article-images'` (public read)
- `INSERT/UPDATE/DELETE` for `authenticated` where `exists (select 1 from admin_users where user_id = auth.uid())` (you can set via SQL, see schema.sql comment)

Or use SQL:
```sql
insert into storage.buckets (id, name, public) values ('article-images','article-images', true)
on conflict (id) do nothing;
```

## 5. Create Admin user
Supabase Dashboard > Authentication > Users > Invite user OR Add user
- Email: e.g. `admin@al-ghunaimi-law.com`
- Password: choose strong
- Auto Confirm: yes

Copy the `User UID` (e.g. `a1b2c3...`).

Then SQL Editor:
```sql
insert into public.admin_users (user_id, role) values ('<USER_UID>', 'admin');
```

Verify:
```sql
select * from public.admin_users;
```

## 6. Run migration (6 static articles → Supabase)
```bash
npm install @supabase/supabase-js
# set .env as above then:
node supabase/migrate-articles.js
# or: node supabase/migrate-articles.js --dry-run
```

Expected output:
```
source article count: 6
migrated: 6
skipped: 0
errors: 0
```

Idempotent: running again will `upsert` by `slug`, no duplicates.

## 7. Test RLS
- As anon (no login): `select * from articles where status='draft'` → 0 rows
- As admin (login via admin/login.html): can `select *` all, `insert`, `update`, `delete`

## 8. Vercel deployment
Push to `main` → Vercel auto deploys.
Check logs: Build should pass (vanilla, no build step).
Verify env vars are set before testing admin.

## 9. Admin URLs (Production)
- `https://al-ghunaimi-law-firm.vercel.app/admin/login.html`
- `https://al-ghunaimi-law-firm.vercel.app/admin/articles.html`
- `https://al-ghunaimi-law-firm.vercel.app/admin/editor.html`

All admin pages have `noindex` and require session.

## 10. Security checklist
- [ ] No `SUPABASE_SECRET_KEY` in any HTML/JS committed
- [ ] `admin_users` not readable by anon (test)
- [ ] `articles` draft not readable by anon (test)
- [ ] Storage bucket policies correct
- [ ] Admin pages `noindex`

## 11. Troubleshooting
- `Invalid API key`: check `SUPABASE_URL` and `PUBLISHABLE_KEY` match project
- `new row violates RLS`: you are not admin (insert into admin_users)
- `duplicate slug`: slug already exists, use different or update existing
