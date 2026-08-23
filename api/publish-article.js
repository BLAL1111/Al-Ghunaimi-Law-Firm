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

  // Verify user is admin via Supabase
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: auth } }
  });
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return res.status(401).json({ error: 'Invalid session' });

  // Check admin_users
  const { data: admin, error: adminErr } = await supabase.from('admin_users').select('role').eq('user_id', user.id).maybeSingle();
  if (adminErr || !admin) return res.status(403).json({ error: 'Not admin' });

  const article = req.body;
  if (!article || !article.slug || !article.title || !article.content_html) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Also ensure article exists in Supabase (should have been inserted already via client)
  // Now persist to data/articles.json via GitHub
  if (!githubToken) {
    // If no GitHub token, just return success (Supabase is source, data/articles.json is fallback)
    return res.status(200).json({ ok: true, warning: 'GITHUB_TOKEN not set, only Supabase saved' });
  }

  try {
    const path = 'data/articles.json';
    const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/${path}`;

    // Get current file
    const getRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json' }
    });
    let sha = null;
    let current = [];
    if (getRes.ok) {
      const j = await getRes.json();
      sha = j.sha;
      const content = Buffer.from(j.content, 'base64').toString('utf8');
      current = JSON.parse(content);
    }

    // Upsert by slug — must persist full fields for offline fallback (see AGENTS.md §16)
    const idx = current.findIndex(a => a.slug === article.slug);
    const now = new Date().toISOString();
    const record = {
      id: article.id || `gh-${Date.now()}`,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || '',
      content_html: article.content_html || '',
      category: article.category || 'general',
      tags: article.tags || [],
      cover_image_url: article.cover_image_url || null,
      cover_image_alt: article.cover_image_alt || null,
      author_name: article.author_name || 'مؤسسة الغنيمي للمحاماة',
      seo_title: article.seo_title || null,
      seo_description: article.seo_description || null,
      og_image_url: article.og_image_url || null,
      canonical_path: article.canonical_path || `/articles/${article.slug}`,
      related_service_slug: article.related_service_slug || null,
      published_at: article.published_at || now,
      updated_at: now,
      created_at: article.created_at || now,
      status: article.status || 'published',
      featured: article.featured || false,
    };
    if (idx >= 0) current[idx] = { ...current[idx], ...record };
    else current.unshift(record);

    // Sort by published_at desc
    current.sort((a,b) => new Date(b.published_at) - new Date(a.published_at));

    const newContent = Buffer.from(JSON.stringify(current, null, 2), 'utf8').toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `feat(article): publish ${article.slug}`,
        content: newContent,
        sha: sha || undefined,
      })
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      throw new Error(`GitHub commit failed: ${t}`);
    }

    return res.status(200).json({ ok: true, persisted: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
