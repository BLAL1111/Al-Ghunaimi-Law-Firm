import { Redis } from '@upstash/redis';

function generateLeadId() {
  // GH- + 6 chars alphanumeric uppercase, e.g. GH-8K4Q2M
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'GH-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch (e) {
    console.warn('Redis init failed', e);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { conversion_type, landing_path, source, medium, campaign, referrer_host } = req.body || {};

  // Basic validation
  if (!conversion_type || !landing_path) {
    return res.status(400).json({ error: 'Missing conversion_type or landing_path' });
  }

  const allowedTypes = ['consultation', 'booking', 'whatsapp', 'contact'];
  const type = allowedTypes.includes(conversion_type) ? conversion_type : 'consultation';

  const lead_id = generateLeadId();
  const now = new Date().toISOString();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  // Simple dedup: same IP+UA+conversion+path within 5 minutes
  const dedupKey = `lead:dedup:${ip}:${ua.slice(0,20)}:${type}:${landing_path}`;
  const redis = getRedis();
  let isDuplicate = false;
  if (redis) {
    try {
      const exists = await redis.get(dedupKey);
      if (exists) isDuplicate = true;
      else await redis.set(dedupKey, '1', { ex: 300 }); // 5 min
    } catch (e) {
      console.warn('dedup check failed', e);
    }
  }

  if (isDuplicate) {
    return res.status(200).json({ lead_id: null, dedup: true, message: 'Duplicate conversion ignored' });
  }

  const record = {
    lead_id,
    created_at: now,
    source: source || 'website',
    medium: medium || 'unknown',
    landing_path: landing_path || '/',
    conversion_type: type,
    campaign: campaign || null,
    referrer_host: referrer_host || req.headers['referer'] || null,
    status: 'new',
    ip_hash: null, // we don't store raw IP for privacy, could hash if needed
  };

  // Store in Upstash if available, else just return (still generate lead_id for user)
  let stored = false;
  let storeError = null;
  if (redis) {
    try {
      // Store as hash with 90 day TTL
      await redis.hset(`lead:${lead_id}`, record);
      await redis.expire(`lead:${lead_id}`, 60 * 60 * 24 * 90);
      // Also add to sorted set for admin listing by date
      await redis.zadd('leads:by_date', { score: Date.now(), member: lead_id });
      stored = true;
    } catch (e) {
      console.error('Redis store failed', e);
      storeError = e.message;
    }
  } else {
    storeError = 'Upstash not configured';
  }

  // Always return lead_id to client, even if store failed (fallback)
  // Client will still open WhatsApp with the code
  return res.status(200).json({
    lead_id,
    stored,
    storeError,
    message: stored ? 'Lead stored' : 'Lead generated (store degraded)',
    whatsapp_text: `مرحبًا، أرغب في التواصل مع مؤسسة الغنيمي بخصوص استشارة قانونية.\n\nرمز طلب الموقع: ${lead_id}`
  });
}
