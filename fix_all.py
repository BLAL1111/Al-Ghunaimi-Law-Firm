import pathlib, re

# 1. Fix FAQ animation - smooth open/close on click, not hover
p = pathlib.Path("script.js")
txt = p.read_text(encoding="utf-8")

# Fix FAQ to all collapsed by default, simple display toggle
if "All collapsed by default" not in txt and "initFaqAccordion" in txt:
    # Find the isFirst logic and replace
    import re
    old = r"const isFirst = idx === 0;\s+if \(!item\.classList\.contains\('open'\) && !item\.classList\.contains\('collapsed'\)\) \{\s+if \(isFirst\) \{[^}]+\} else \{[^}]+\}\s+\}"
    new = """// All collapsed by default - user opens manually
        if (!item.classList.contains('open') && !item.classList.contains('collapsed')) {
          item.classList.add('collapsed');
          item.classList.remove('open');
          q.setAttribute('aria-expanded', 'false');
        }"""
    m = re.search(old, txt, re.S)
    if m:
        txt = txt.replace(m.group(0), new.strip())
        p.write_text(txt, encoding="utf-8")
        print("FAQ all collapsed fixed in JS")
    else:
        print("FAQ already all collapsed")

# Fix styles.css
p2 = pathlib.Path("styles.css")
txt2 = p2.read_bytes().decode("utf-8", errors="replace").replace("\ufffd", " ")

# 1. Fix FAQ grid to single column
if "repeat(2, 1fr)" in txt2 and ".faq-grid" in txt2:
    txt2 = re.sub(r"(\.faq-grid[^{]*\{[^}]*grid-template-columns:[^;]*?)repeat\(2,\s*1fr\)", r"\1 1fr", txt2)
    if "max-width:760px" not in txt2:
        txt2 = txt2.replace(".faq-grid{display:grid;grid-template-columns:1fr;gap:16px}", ".faq-grid{display:grid;grid-template-columns:1fr;gap:16px;max-width:760px;margin:0 auto}")
    print("FAQ grid patched")

# 2. Fix FAQ animation - smooth open/close on click
if "cubic-bezier(0.4,0,0.2,1)" not in txt2:
    css = """
/* ===== PREMIUM FAQ - SMOOTH ANIMATION ON CLICK (NOT HOVER) ===== */
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
  width: 36px !important; height: 36px !important;
  display: grid !important; place-items: center !important;
  background: rgba(212,175,55,0.12) !important;
  border: 1px solid rgba(212,175,55,0.22) !important;
  border-radius: 10px !important; font-size: 0.85rem !important;
  color: var(--accent-gold) !important;
  font-family: "Font Awesome 6 Free" !important; font-weight: 900 !important;
  -webkit-font-smoothing: antialiased !important;
  flex-shrink: 0 !important; line-height: 1 !important;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important;
}
.faq-item.open .faq-question i {
  background: var(--accent-gold) !important; color: #0B0C0E !important;
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
  width: 4px; height: 4px;
  background: var(--accent-gold);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.faq-item.open .faq-question::after {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
}
.faq-question::before {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.15);
  display: grid;
  place-items: center;
  transition: all 0.3s ease;
}
.faq-question i {
  position: relative; z-index: 1;
  width: 36px !important; height: 36px !important;
  display: grid !important; place-items: center !important;
  background: rgba(212,175,55,0.12) !important;
  border: 1px solid rgba(212,175,55,0.22) !important;
  border-radius: 10px !important; font-size: 0.85rem !important;
  color: var(--accent-gold) !important;
  font-family: "Font Awesome 6 Free" !important; font-weight: 900 !important;
  -webkit-font-smoothing: antialiased !important;
  flex-shrink: 0 !important; line-height: 1 !important;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important;
}
.faq-item.open .faq-question i {
  background: var(--accent-gold) !important; color: #0B0C0E !important;
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
  width: 4px; height: 4px;
  background: var(--accent-gold);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.faq-item.open .faq-question::after {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
}
.faq-question::before {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.15);
  display: grid;
  place-items: center;
  transition: all 0.3s ease.
}
.faq-question i {
  position: relative; z-index: 1;
  width: 36px !important; height: 36px !important;
  display: grid !important; place-items: center !important;
  background: rgba(212,175,55,0.12) !important;
  border: 1px solid rgba(212,175,55,0.22) !important;
  border-radius: 10px !important; font-size: 0.85rem !important;
  color: var(--accent-gold) !important;
  font-family: "Font Awesome 6 Free" !important; font-weight: 900 !important;
  -webkit-font-smoothing: antialiased !important;
  flex-shrink: 0 !important; line-height: 1 !important;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important.
}
.faq-item.open .faq-question i {
  background: var(--accent-gold) !important; color: #0B0C0E !important;
  border-color: var(--accent-gold) !important.
  transform: rotate(90deg) !important.
  box-shadow: 0 4px 12px rgba(212,175,55,0.35) !important.
}
.faq-item:hover .faq-question i {
  border-color: var(--accent-gold) !important.
}
.faq-question { padding-right: 14px !important. }
html[dir="rtl"] .faq-question { padding-right: 14px !important. }
.faq-answer {
  max-height: 0 !important.
  opacity: 0 !important.
  overflow: hidden !important.
  padding: 0 24px !important.
  border-top: 1px solid rgba(212,175,55,0.08) !important.
  transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, padding 0.3s ease !important.
}
.faq-item.open .faq-answer {
  max-height: 1000px !important.
  opacity: 1 !important.
  padding: 0 24px 24px 24px !important.
  border-top-color: rgba(212,175,55,0.12) !important.
}
.faq-answer p {
  margin: 16px 0 0 0 !important.
  font-size: 0.92rem !important.
  line-height: 1.85 !important.
  color: var(--text-secondary) !important.
}
.faq-item:hover .faq-question {
  background: rgba(212,175,55,0.04) !important.
}
.faq-item.open .faq-question {
  background: rgba(212,175,55,0.06) !important.
}
/* Light mode */
[data-theme="light"] .faq-item {
  background: #ffffff !important.
  border-color: rgba(212,175,55,0.18) !important.
  box-shadow: 0 4px 18px rgba(0,0,0,0.05) !important.
}
[data-theme="light"] .faq-item.open,
[data-theme="light"] .faq-item:hover {
  border-left-color: var(--accent-gold) !important.
  box-shadow: 0 12px 28px rgba(212,175,55,0.15) !important.
}
[data-theme="light"] .faq-question { color: #1a1d23 !important. }
[data-theme="light"] .faq-answer p { color: #3a3f4a !important. }
[data-theme="light"] .faq-question i {
  background: rgba(212,175,55,0.10) !important; border-color: rgba(212,175,55,0.25) !important.
}
[data-theme="light"] .faq-item.open .faq-question i {
  background: var(--accent-gold) !important; color: #0B0C0E !important.
}
"""
if "cubic-bezier(0.4,0,0.2,1)" not in txt2:
    txt2 = txt2 + "\n\n" + css
    print("FAQ animation CSS added")
else:
    print("FAQ CSS already exists")

# 2. Hero backgrounds - larger, better positioned, proper cover
if "min-height: 72vh" not in txt2 or "sarh_qanony" not in txt2:
    txt2 = txt2 + "\n\n" + hero_css
    print("Hero backgrounds fixed")
else:
    # Ensure the existing hero CSS has the new values
    txt2 = txt2.replace("min-height: 56vh", "min-height: 72vh !important")
    txt2 = txt2.replace("min-height: 52vh", "min-height: 66vh !important")
    txt2 = txt2.replace("background-position: center 28%", "background-position: center 22% !important")
    txt2 = txt2.replace("background-position: center center", "background-position: center center !important")
    print("Hero backgrounds fixed")

# Ensure overlay is lighter for better image visibility
if "rgba(11,12,14,0.35)" in txt2:
    txt2 = txt2.replace("rgba(11,12,14,0.35)", "rgba(11,12,14,0.22)")
    txt2 = txt2.replace("rgba(11,12,14,0.55)", "rgba(11,12,14,0.38)")
    print("Overlay lightened")

# Add large screen fixes
add_large = """
@media (min-width: 1400px) {
  .page-header.services-hero { min-height: 78vh !important; background-position: center 18% !important; }
  .page-header.articles-hero { min-height: 70vh !important; background-position: center center !important; }
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
"""
if "@media (min-width: 1400px)" not in txt2 or "72vh" not in txt2.split("@media (min-width: 1400px)")[-1][:500]:
    txt2 = txt2 + "\n\n" + add_large
    print("Large screen fix added")

p2.write_text(txt2, encoding="utf-8")
print("All premium fixes applied")
print(f"Length: {len(txt2)}")