// lead.js — Website Lead Attribution (Upstash independent)
(function() {
  function getLandingPath() { return location.pathname; }
  function getReferrerHost() { try { return document.referrer ? new URL(document.referrer).hostname : null; } catch(e){ return null; } }

  function generateFallbackId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'GH-';
    for (let i=0;i<6;i++) id += chars[Math.floor(Math.random()*chars.length)];
    return id;
  }

  async function createLead(conversion_type) {
    const payload = {
      conversion_type: conversion_type || 'consultation',
      landing_path: getLandingPath(),
      source: 'website',
      medium: conversion_type === 'whatsapp' ? 'whatsapp' : 'website',
      campaign: new URLSearchParams(location.search).get('utm_campaign') || null,
      referrer_host: getReferrerHost()
    };
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.lead_id) return j;
      // dedup case
      if (j.dedup) return { lead_id: generateFallbackId(), stored: false, fallback: true };
      throw new Error(j.error || 'Lead failed');
    } catch (e) {
      console.warn('Lead API failed, fallback', e);
      const id = generateFallbackId();
      return { lead_id: id, stored: false, fallback: true, whatsapp_text: `مرحبًا، أرغب في التواصل مع مؤسسة الغنيمي بخصوص استشارة قانونية.\n\nرمز طلب الموقع: ${id}` };
    }
  }

  function openWhatsAppWithLead(lead) {
    const phone = '201126118276';
    const text = lead.whatsapp_text || `مرحبًا، أرغب في التواصل مع مؤسسة الغنيمي بخصوص استشارة قانونية.\n\nرمز طلب الموقع: ${lead.lead_id}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  }

  // Attach to all WhatsApp links
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('a[href*="wa.me"], a.js-whatsapp-lead');
    if (!a) return;
    // Only handle website lead WhatsApp, not admin
    if (a.closest('.admin-wrap')) return;
    e.preventDefault();
    const originalText = a.textContent;
    try {
      a.style.pointerEvents = 'none';
      a.style.opacity = '0.7';
      const lead = await createLead('whatsapp');
      // Show lead code to user briefly
      const existing = document.getElementById('lead-code-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'lead-code-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);padding:10px 16px;border-radius:10px;box-shadow:var(--shadow-card);z-index:9999;font-size:0.85rem;';
      toast.textContent = lead.stored ? `رمز طلبك: ${lead.lead_id} — سيصلك على واتساب` : `رمز طلبك: ${lead.lead_id} (احفظه)`;
      document.body.appendChild(toast);
      setTimeout(()=> toast.remove(), 4000);
      openWhatsAppWithLead(lead);
    } finally {
      a.style.pointerEvents = '';
      a.style.opacity = '';
    }
  });

  // Expose for booking form
  window.GhonemyLead = { createLead, openWhatsAppWithLead };
})();
