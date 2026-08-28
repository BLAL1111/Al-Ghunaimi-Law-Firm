import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const base = 'https://al-ghunaimi-law-firm.vercel.app';
  const staticUrls = [
    { loc: `${base}/`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/about`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.9' },
    { loc: `${base}/services`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/articles`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '0.8' },
    { loc: `${base}/contact`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.8' },
    { loc: `${base}/booking`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/criminal`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/family`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/inheritance`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/real-estate`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/corporate`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/contracts`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/services/6th-october`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.8' },
    { loc: `${base}/services/sheikh-zayed`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.8' },
    { loc: `${base}/services/giza`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.8' },
    { loc: `${base}/services/cairo`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.8' },
    // EN variants
    { loc: `${base}/en/`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/en/services`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '0.8' },
    { loc: `${base}/en/services/criminal`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/family`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/inheritance`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/real-estate`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/corporate`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/contracts`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/6th-october`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/sheikh-zayed`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/giza`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/en/services/cairo`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    // FR variants
    { loc: `${base}/fr/`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/fr/services`, lastmod: '2026-08-28', changefreq: 'weekly', priority: '0.8' },
    { loc: `${base}/fr/services/criminal`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/family`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/inheritance`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/real-estate`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/corporate`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/contracts`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/6th-october`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/sheikh-zayed`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/giza`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
    { loc: `${base}/fr/services/cairo`, lastmod: '2026-08-28', changefreq: 'monthly', priority: '0.7' },
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
  // Fallback: if Supabase gave 0 or env missing, use hardcoded snapshot — Vercel-safe (no fs, no self-fetch)
  if (articleUrls.length === 0) {
    const fallbackSlugs = [
      { slug: 'real-estate-contracts-6th-october', lastmod: '2026-06-15' },
      { slug: 'company-formation-egypt-2026', lastmod: '2026-07-02' },
      { slug: 'criminal-appeal-cassation', lastmod: '2026-07-18' },
      { slug: 'labor-law-employee-rights', lastmod: '2026-07-28' },
      { slug: 'family-law-custody-alimony', lastmod: '2026-08-05' },
      { slug: 'commercial-contracts-drafting', lastmod: '2026-08-11' },
    ];
    articleUrls = fallbackSlugs.map(a => ({ loc: `${base}/articles/${a.slug}`, lastmod: a.lastmod, changefreq: 'yearly', priority: '0.6' }));
  }

  const all = [...staticUrls, ...articleUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
