// Supabase Production — Al-Ghunaimi Law Firm
window.SUPABASE_CONFIG = {
  url: 'https://kmjakwyabrgovorgbqed.supabase.co',
  publishableKey: 'sb_publishable_Yv9SwndhUEyLChaF-AmqPw_Y1rves2F'
};
// Optional: allow override via localStorage ONLY for GitHub Pages preview / localhost (never for vercel.app production)
const _host = location.hostname.toLowerCase();
const _allowOverride = _host.includes('github.io') || _host === 'localhost' || _host === '127.0.0.1' || location.protocol === 'file:';
if (_allowOverride) {
  const _lsUrl = localStorage.getItem('supabase_url');
  const _lsKey = localStorage.getItem('supabase_key');
  if (_lsUrl && !_lsUrl.includes('YOUR_PROJECT') && _lsUrl.startsWith('http')) window.SUPABASE_CONFIG.url = _lsUrl;
  if (_lsKey && !_lsKey.includes('YOUR_PROJECT') && _lsKey.length > 20) window.SUPABASE_CONFIG.publishableKey = _lsKey;
}
