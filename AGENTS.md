# AGENTS.md — Al-Ghonemy Law Firm Website

## Stack
Vanilla static site (no build, no package manager, no framework).
Open `index.html` directly in a browser — full reload to test.

## Files
- `index.html` (559 lines) — all sections: hero, about, team, practices, insights, contact, modal, footer
- `styles.css` (~1265 lines) — dark/light theme via `[data-theme]`, RTL via `[dir]`, CSS custom properties
- `script.js` (256 lines) — language switcher, theme toggle, mobile drawer, canvas animation, booking form → WhatsApp
- `translations.js` (374 lines) — global `translations` object with `ar`/`en`/`fr` keys
- `robots.txt` + `sitemap.xml` — SEO crawl support
- `img/` — 7 assets (team photos, logos, backgrounds)

## Conventions
- **Language**: Arabic default (`dir="rtl"`). EN/FR use `dir="ltr"`. All translatable text via `data-i18n`. Persisted in `localStorage` key `ghonemy_lang`.
- **Theme**: Dark default, toggled via `data-theme` on `<html>`. Persisted in `localStorage` key `ghonemy_theme`.
- **Booking**: Submits via WhatsApp link to `+20 112 611 8276` — no backend.
- **Mobile drawer**: Collapses at **≤992px**.
- **Script order**: `translations.js` must load before `script.js` (index.html L495-496).
- **Font Awesome**: Loaded non-blocking via `media="print"` + `onload="this.media='all'"`.

## Config
- `opencode.json` has Playwright MCP enabled (`@playwright/mcp` via npx).

## SEO
- JSON-LD structured data for `LegalService` schema in `<head>` (schema.org).
- Open Graph and Twitter Card meta tags for social sharing.
- Canonical URL set to `https://alghonemy-law.com`.
- `robots.txt` + `sitemap.xml` at root.

## Style
- Gold accent: `#D4AF37` (dark), `#B8860B` (light)
- Fonts: `Cairo`/`Amiri` (Arabic), `Cinzel`/`Plus Jakarta Sans` (Latin) — Google Fonts + Font Awesome 6 from CDN
- Google Fonts loaded via `<link>` in `<head>` (not `@import`) with `preconnect` hints.
- No external CSS framework
- Responsive breakpoints: 1250, 1200, 1100, 1024, 992, 768, 480, 360
- Sections below the fold use `content-visibility: auto` for faster paint.

## Performance Notes
- All images have explicit `width`/`height` attributes to prevent CLS.
- Below-fold images use `loading="lazy"`.
- No inline styles — all moved to CSS classes.
- Canvas animation pauses via `IntersectionObserver` when hero section is not visible.

## Navbar
- Single `<li.nav-actions-li>` inside `<ul.nav-menu>` — desktop: `flex-shrink: 0` (right); mobile: `margin-top: auto` (drawer bottom)
- 6 nav links wrapped in `<li.nav-links-item>` → `<ul.nav-link-list>` — desktop: `flex: 1; justify-content: center` (center); mobile: stacked column
- Theme toggle uses Font Awesome icons (`fa-sun`/`fa-moon`), not text — swapped by `initTheme()` in `script.js`
