// Fill with your Supabase project values (publishable key is safe for browser)
// For Vercel: set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Environment Variables
// and this file will be overridden at build time if you use a build step, or just edit manually.
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'YOUR_PUBLISHABLE_KEY'
};
// Optional: allow override via localStorage for GitHub Pages preview (not recommended for production)
// localStorage.setItem('supabase_url', '...')
// localStorage.setItem('supabase_key', '...')
if (localStorage.getItem('supabase_url')) window.SUPABASE_CONFIG.url = localStorage.getItem('supabase_url');
if (localStorage.getItem('supabase_key')) window.SUPABASE_CONFIG.publishableKey = localStorage.getItem('supabase_key');
