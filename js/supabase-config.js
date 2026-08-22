// Supabase Production — Al-Ghunaimi Law Firm
window.SUPABASE_CONFIG = {
  url: 'https://kmjakwyabrgovorgbqed.supabase.co',
  publishableKey: 'sb_publishable_Yv9SwndhUEyLChaF-AmqPw_Y1rves2F'
};
// Optional: allow override via localStorage for GitHub Pages preview (not recommended for production)
// localStorage.setItem('supabase_url', '...')
// localStorage.setItem('supabase_key', '...')
if (localStorage.getItem('supabase_url')) window.SUPABASE_CONFIG.url = localStorage.getItem('supabase_url');
if (localStorage.getItem('supabase_key')) window.SUPABASE_CONFIG.publishableKey = localStorage.getItem('supabase_key');
