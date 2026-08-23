import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const base = 'https://al-ghunaimi-law-firm.vercel.app';
  const staticUrls = [
    { loc: `${base}/`, lastmod: '2026-08-11', changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/about`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.9' },
    { loc: `${base}/services`, lastmod: '2026-08-11', changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/articles`, lastmod: '2026-08-11', changefreq: 'weekly', priority: '0.8' },
    { loc: `${base}/contact`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.8' },
    { loc: `${base}/booking`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/criminal`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/family`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/inheritance`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/real-estate`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/corporate`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/contracts`, lastmod: '2026-08-11', changefreq: 'monthly', priority: '0.7' },
  ];

  let articleUrls = [];
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { data, error } = await supabase
        .from('articles')
        .select('slug,published_at,updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (!error && data) {
        articleUrls = data.map(a => ({
          loc: `${base}/articles/${a.slug}`,
          lastmod: (a.updated_at || a.published_at || new Date().toISOString()).slice(0,10),
          changefreq: 'yearly',
          priority: '0.6'
        }));
      }
    }
  } catch (e) {
    console.warn('sitemap supabase error', e);
  }
  // Fallback: if Supabase gave 0, try snapshot via fetch (Vercel-safe, no fs) — ensures sitemap works when DB is down
  if (articleUrls.length === 0) {
    try {
      let arr = null;
      try {
        const r = await fetch(`${base}/data/articles.json`, { cache: 'no-store' });
        if (r.ok) arr = await r.json();
      } catch (e) { /* ignore, try fs fallback */ }
      if (!arr) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const pMod = path.default || path;
          const fMod = fs.default || fs;
          const filePath = pMod.join(process.cwd(), 'data', 'articles.json');
          if (fMod.existsSync(filePath)) {
            const raw = fMod.readFileSync(filePath, 'utf8');
            arr = JSON.parse(raw);
          }
        } catch (e) { /* fs not available */ }
      }
      if (Array.isArray(arr)) {
        const pub = arr.filter(a => a.status === 'published' && a.slug);
        if (pub.length) {
          articleUrls = pub.map(a => ({
            loc: `${base}/articles/${a.slug}`,
            lastmod: (a.updated_at || a.published_at || new Date().toISOString()).slice(0,10),
            changefreq: 'yearly',
            priority: '0.6'
          }));
        }
      }
    } catch (e) { console.warn('sitemap fallback file error', e); }
  }

  const all = [...staticUrls, ...articleUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
