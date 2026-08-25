// Simple Supabase client wrapper for vanilla site
// Requires: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
// and js/supabase-config.js loaded before this

(function() {
  function getConfig() {
    if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.publishableKey && !window.SUPABASE_CONFIG.url.includes('YOUR_PROJECT')) {
      return window.SUPABASE_CONFIG;
    }
    // Fallback: try to read from meta tags (if injected by Vercel)
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-publishable-key"]');
    if (urlMeta && keyMeta) {
      return { url: urlMeta.content, publishableKey: keyMeta.content };
    }
    return null;
  }

  function createClient() {
    const cfg = getConfig();
    if (!cfg) {
      console.warn('Supabase not configured. See SUPABASE_SETUP.md and js/supabase-config.js');
      return null;
    }
    if (!window.supabase) {
      console.error('Supabase JS not loaded. Include https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
      return null;
    }
    return window.supabase.createClient(cfg.url, cfg.publishableKey);
  }

  window.GhonemySupabase = { getConfig, createClient };
})();
