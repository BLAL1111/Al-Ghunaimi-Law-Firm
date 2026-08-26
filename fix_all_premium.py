import pathlib, re

p = pathlib.Path("styles.css")
txt = p.read_bytes().decode("utf-8", errors="replace").replace("\ufffd", " ")

# 1. Fix FAQ - prevent closing on hover, add smooth animations
# Current: .faq-item:hover only changes border-color
# Need: smooth transitions, no close on hover, smooth accordion animation

faq_css = """
/* ===== PREMIUM FAQ - SMOOTH ANIMATIONS, NO CLOSE ON HOVER ===== */
.faq-item {
  background: linear-gradient(145deg, rgba(23,26,31,0.95), rgba(18,21,26,0.98)) !important;
  border: 1px solid rgba(212,175,55,0.15) !important;
  border-left: 3px solid transparent !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1) !important;
  display: flex !important;
  flex-direction: column !important;
}
.faq-item:hover {
  border-left-color: var(--accent-gold) !important;
  box-shadow: 0 12px 32px rgba(212,175,55,0.15) !important;
  transform: translateY(-2px) !important;
}
.faq-item.open {
  border-left-color: var(--accent-gold) !important;
  box-shadow: 0 8px 28px rgba(212,175,55,0.2) !important;
}
.faq-question {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 24px 24px !important;
  margin: 0 !important;
  font-size: 1.05rem !important;
  font-weight: 800 !important;
  color: var(--text-primary) !important;
  line-height: 1.4 !important;
  cursor: pointer !important;
  user-select: none !important;
  position: relative !important;
  list-style: none !important;
  background: transparent !important;
  transition: background 0.3s ease !important;
}
.faq-question i {
  width: 36px !important;
  height: 36px !important;
  display: grid !important;
  place-items: center !important;
  background: rgba(212,175,55,0.12) !important;
  border: 1px solid rgba(212,175,55,0.22) !important;
  border-radius: 10px !important;
  font-size: 0.85rem !important;
  color: var(--accent-gold) !important;
  font-family: "Font Awesome 6 Free" !important;
  font-weight: 900 !important;
  -webkit-font-smoothing: antialiased !important;
  flex-shrink: 0 !important;
  line-height: 1 !important;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important;
}
.faq-item.open .faq-question i,
.faq-item:hover .faq-question i {
  background: var(--accent-gold) !important;
  color: #0B0C0E !important;
  border-color: var(--accent-gold) !important;
  transform: rotate(90deg) !important;
  box-shadow: 0 4px 12px rgba(212,175,55,0.35) !important;
}
.faq-question::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--accent-gold);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.faq-item.open .faq-question::after {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
}
.faq-answer {
  max-height: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
  padding: 0 24px !important;
  border-top: 1px solid rgba(212,175,55,0.08) !important;
  transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, padding 0.3s ease !important;
}
.faq-item.open .faq-answer {
  max-height: 1000px !important;
  opacity: 1 !important;
  padding: 0 24px 24px 24px !important;
  border-top-color: rgba(212,175,55,0.12) !important;
}
.faq-answer p {
  margin: 16px 0 0 0 !important;
  font-size: 0.92rem !important;
  line-height: 1.85 !important;
  color: var(--text-secondary) !important;
}
.faq-item:hover .faq-question {
  background: rgba(212,175,55,0.04) !important;
}
.faq-item.open .faq-question {
  background: rgba(212,175,55,0.06) !important;
}
/* Light mode */
[data-theme="light"] .faq-item {
  background: #ffffff !important;
  border-color: rgba(212,175,55,0.18) !important;
  box-shadow: 0 4px 18px rgba(0,0,0,0.06) !important;
}
[data-theme="light"] .faq-item:hover,
[data-theme="light"] .faq-item.open {
  border-left-color: var(--accent-gold) !important;
  box-shadow: 0 12px 28px rgba(212,175,55,0.15) !important;
}
[data-theme="light"] .faq-question { color: #1a1d23 !important; }
[data-theme="light"] .faq-answer p { color: #3a3f4a !important; }
[data-theme="light"] .faq-question i {
  background: rgba(212,175,55,0.10) !important;
  border-color: rgba(212,175,55,0.25) !important;
}
[data-theme="light"] .faq-item.open .faq-question i,
[data-theme="light"] .faq-item:hover .faq-question i {
  background: var(--accent-gold) !important;
  color: #0B0C0E !important;
}
"""

# 2. Hero backgrounds - larger, better positioned, better cover
hero_css = """
/* ===== PREMIUM HERO - LARGER, BETTER POSITIONED ===== */
.page-header.services-hero,
.page-header.articles-hero {
  position: relative !important;
  min-height: 72vh !important;
  padding: 120px 24px 100px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-attachment: scroll !important;
  overflow: hidden !important;
  border-bottom: 1px solid rgba(212,175,55,0.15) !important;
}
.page-header.services-hero {
  background-image: url('img/sarh_qanony.jpg') !important;
  background-position: center 22% !important;
  min-height: 72vh !important;
  padding: 120px 24px 100px !important;
}
.page-header.articles-hero {
  background-image: url('img/law_books_desk.webp') !important;
  background-image: image-set(url('img/law_books_desk.webp') type("image/webp"), url('img/law_books_desk.jpg') type("image/jpeg")) !important;
  background-position: center center !important;
  min-height: 66vh !important;
  padding: 110px 24px 90px !important;
}
.page-header.services-hero::before,
.page-header.articles-hero::before {
  content: '' !important;
  position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;
  background: linear-gradient(180deg, rgba(11,12,14,0.22) 0%, rgba(11,12,14,0.38) 40%, rgba(11,12,14,0.72) 100%) !important;
  z-index: 1 !important;
}
.page-header.articles-hero::before {
  background: linear-gradient(180deg, rgba(11,12,14,0.28) 0%, rgba(11,12,14,0.52) 50%, rgba(11,12,14,0.80) 100%) !important;
}
/* Bottom gradient line */
.page-header.services-hero::after,
.page-header.articles-hero::after {
  content: '' !important;
  position: absolute !important; bottom: 0 !important; left: 0 !important; width: 100% !important; height: 1px !important;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent) !important;
  z-index: 2 !important;
}
.page-header.services-hero .container,
.page-header.articles-hero .container {
  position: relative !important; z-index: 2 !important; max-width: 860px !important; margin: 0 auto !important;
}
.page-header.services-hero .page-title,
.page-header.articles-hero .page-title {
  font-size: 2.8rem !important; font-weight: 900 !important; line-height: 1.25 !important;
  color: #ffffff !important; text-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
  margin-bottom: 14px !important;
}
[data-theme="light"] .page-header.services-hero .page-title,
[data-theme="light"] .page-header.articles-hero .page-title {
  color: #1a1d23 !important; text-shadow: 0 2px 12px rgba(255,255,255,0.6) !important;
}
.page-header.services-hero .page-subtitle,
.page-header.articles-hero .page-subtitle {
  font-size: 1.05rem !important; line-height: 1.8 !important; max-width: 720px !important; margin: 0 auto !important;
  color: rgba(255,255,255,0.88) !important; text-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
}
[data-theme="light"] .page-header.services-hero .page-subtitle,
[data-theme="light"] .page-header.articles-hero .page-subtitle {
  color: rgba(26,29,35,0.85) !important; text-shadow: none !important;
}
@media (max-width: 768px) {
  .page-header.services-hero, .page-header.articles-hero { min-height: 52vh !important; padding: 90px 16px 70px !important; background-position: center 25% !important; }
  .page-header.services-hero .page-title, .page-header.articles-hero .page-title { font-size: 2.1rem !important; }
  .page-header.services-hero .page-subtitle, .page-header.articles-hero .page-subtitle { font-size: 0.95rem !important; }
}
@media (max-width: 480px) {
  .page-header.services-hero, .page-header.articles-hero { min-height: 48vh !important; padding: 80px 14px 60px !important; }
  .page-header.services-hero .page-title, .page-header.articles-hero .page-title { font-size: 1.75rem !important; }
}
@media (min-width: 1400px) {
  .page-header.services-hero { min-height: 78vh !important; background-position: center 18% !important; }
  .page-header.articles-hero { min-height: 70vh !important; background-position: center center !important; }
}
@media (min-width: 1920px) {
  .page-header.services-hero, .page-header.articles-hero { background-size: cover !important; background-position: center 16% !important; }
}
@media (max-width: 480px) {
  .page-header.services-hero, .page-header.articles-hero { min-height: 48vh !important; padding: 80px 14px 60px !important; }
  .page-header.services-hero .page-title, .page-header.articles-hero .page-title { font-size: 1.7rem !important; }
}
"""

# 3. Area cards - better background positioning
area_css = """
/* ===== AREA CARDS - BETTER BACKGROUND & SPACING ===== */
.area-card {
  background: linear-gradient(145deg, rgba(23,26,31,0.95), rgba(18,21,26,0.98)) !important;
  border: 1px solid rgba(212,175,55,0.15) !important;
  border-radius: 18px !important;
  padding: 28px 22px !important;
  position: relative !important;
  overflow: hidden !important;
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1) !important;
  display: flex !important; flex-direction: column !important;
}
.area-card:hover {
  border-color: rgba(212,175,55,0.3) !important;
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1) !important;
  transform: translateY(-6px) !important;
}
.area-card::after {
  content: '' !important;
  position: absolute !important; top: -50% !important; left: -50% !important; width: 200% !important; height: 200% !important;
  background: radial-gradient(circle at center, rgba(212,175,55,0.06), transparent 70%) !important;
  opacity: 0 !important; transition: opacity 0.4s ease !important; pointer-events: none !important;
}
.area-card:hover::after { opacity: 1 !important; }
.area-card .area-icon {
  width: 56px !important; height: 56px !important;
  display: grid !important; place-items: center !important;
  background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05)) !important;
  border: 1px solid rgba(212,175,55,0.2) !important;
  border-radius: 14px !important; margin-bottom: 18px !important;
  font-size: 1.4rem !important; color: var(--accent-gold) !important;
  transition: all 0.3s ease !important;
}
.area-card:hover .area-icon {
  background: var(--accent-gold) !important;
  color: #0B0C0E !important;
  transform: scale(1.08) rotate(5deg) !important;
  box-shadow: 0 8px 20px rgba(212,175,55,0.35) !important;
}
.area-card h3 { font-size: 1.15rem !important; font-weight: 800 !important; margin-bottom: 12px !important; line-height: 1.4 !important; }
.area-card p { font-size: 0.88rem !important; line-height: 1.75 !important; color: var(--text-secondary) !important; flex-grow: 1; margin-bottom: 14px !important; }
.area-card .area-services { gap: 8px !important; margin-bottom: 18px !important; }
.area-card .area-services li { font-size: 0.82rem !important; padding: 6px 12px !important; background: rgba(212,175,55,0.06); border-radius: 20px; border: 1px solid transparent; transition: all 0.2s ease; }
.area-card:hover .area-services li { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.15); }
.area-card .area-link { color: var(--accent-gold) !important; font-weight: 800 !important; gap: 6px !important; font-size: 0.86rem !important; padding: 7px 14px !important; border: 1.5px solid rgba(212,175,55,0.18) !important; border-radius: 24px !important; background: rgba(212,175,55,0.07) !important; width: fit-content !important; align-self: flex-start !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; transition: all 0.25s ease !important; text-decoration: none !important; }
.area-card .area-link:hover { gap: 8px !important; color: #0B0C0E !important; background: var(--accent-gold) !important; border-color: var(--accent-gold) !important; transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(212,175,55,0.3) !important; }
.area-card .area-link:focus-visible { outline: 2px solid var(--accent-gold) !important; outline-offset: 2px !important; }
"""

# Read and update
p = pathlib.Path("styles.css")
txt = p.read_bytes().decode("utf-8", errors="replace").replace("\ufffd", " ")

# Add all CSS - append at end
txt = txt + "\n\n" + faq_css + "\n\n" + hero_css + "\n\n" + area_css + "\n"

p.write_text(txt, encoding="utf-8")
print("All premium fixes applied")