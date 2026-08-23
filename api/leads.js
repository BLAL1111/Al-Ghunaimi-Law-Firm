import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseAnon) return res.status(500).json({ error: 'Supabase not configured' });

  const supabase = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Invalid session' });

  const { data: admin } = await supabase.from('admin_users').select('role').eq('user_id', user.id).maybeSingle();
  if (!admin) return res.status(403).json({ error: 'Not admin' });

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'Upstash not configured', leads: [] });

  try {
    // Get latest 50 leads
    const ids = await redis.zrange('leads:by_date', 0, 49, { rev: true });
    if (!ids || !ids.length) return res.status(200).json({ leads: [] });
    const pipeline = redis.pipeline();
    ids.forEach(id => pipeline.hgetall(`lead:${id}`));
    const results = await pipeline.exec();
    // pipeline returns array of results
    const leads = results.map((r, i) => {
      const data = r;
      // Upstash pipeline returns data directly
      return data;
    }).filter(Boolean);
    return res.status(200).json({ leads });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
