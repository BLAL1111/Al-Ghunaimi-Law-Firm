import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO || 'BLAL1111/Al-Ghunaimi-Law-Firm';

  if (!supabaseUrl || !supabaseAnon) return res.status(500).json({ error: 'Supabase not configured' });

  const supabase = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Invalid session' });

  const { data: admin } = await supabase.from('admin_users').select('role').eq('user_id', user.id).maybeSingle();
  if (!admin) return res.status(403).json({ error: 'Not admin' });

  try {
    const { data: articles, error } = await supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false });
    if (error) throw error;

    // Build snapshot with version
    const snapshot = {
      snapshot_version: Date.now(),
      snapshot_generated_at: new Date().toISOString(),
      articles: articles.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        tags: a.tags,
        content_html: a.content_html,
        cover_image_url: a.cover_image_url,
        cover_image_alt: a.cover_image_alt,
        author_name: a.author_name,
        published_at: a.published_at,
        updated_at: a.updated_at,
        seo_title: a.seo_title,
        seo_description: a.seo_description,
        canonical_path: a.canonical_path || `/articles/${a.slug}`,
        related_service_slug: a.related_service_slug,
      }))
    };

    // Also update data/articles.json for public fallback (legacy array format)
    const legacy = snapshot.articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      tags: a.tags,
      content_html: a.content_html,
      cover_image_url: a.cover_image_url,
      cover_image_alt: a.cover_image_alt,
      author_name: a.author_name,
      published_at: a.published_at,
      updated_at: a.updated_at,
      seo_title: a.seo_title,
      seo_description: a.seo_description,
      canonical_path: a.canonical_path,
      related_service_slug: a.related_service_slug,
      status: 'published',
    }));

    if (!githubToken) {
      // Return snapshot without GitHub commit (still useful for debugging)
      return res.status(200).json({ synced: articles.length, snapshot, warning: 'GITHUB_TOKEN not set, snapshot not persisted to GitHub' });
    }

    // Commit to GitHub
    const path1 = 'data/articles.json';
    const path2 = 'data/snapshot-meta.json';
    for (const [path, content] of [[path1, JSON.stringify(legacy, null, 2)], [path2, JSON.stringify({ snapshot_version: snapshot.snapshot_version, snapshot_generated_at: snapshot.snapshot_generated_at, article_count: legacy.length, last_sync_status: 'SYNCED' }, null, 2)]]) {
      const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/${path}`;
      const getRes = await fetch(apiUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json' } });
      let sha = null;
      if (getRes.ok) {
        const j = await getRes.json();
        sha = j.sha;
      }
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `chore(snapshot): sync ${legacy.length} articles v${snapshot.snapshot_version}`,
          content: Buffer.from(content, 'utf8').toString('base64'),
          sha: sha || undefined,
        })
      });
      if (!putRes.ok) {
        const t = await putRes.text();
        throw new Error(`GitHub ${path} failed: ${t}`);
      }
    }

    return res.status(200).json({ synced: articles.length, snapshot_version: snapshot.snapshot_version });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
