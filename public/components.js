// ═══════════════════════════════════════════════════════════════
// components.js — Shared Header/Footer for Al-Ghonemy Law Firm
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const BASE = '';
  const WHATSAPP = 'https://wa.me/201126118276';

  function getPathPrefix() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/services/') || path.includes('/articles/')) {
      return '../';
    }
    return '';
  }

  const isLocal = window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || !window.location.hostname;

  function renderLoader() {
    if (document.getElementById('page-loader')) return;
    const html = `<div id="page-loader" class="page-loader" aria-hidden="true"><div class="loader-inner"><div class="loader-logo"></div><div class="loader-bar"><span></span></div></div></div>`;
    if (document.body) document.body.insertAdjacentHTML('afterbegin', html);
    else document.addEventListener('DOMContentLoaded', () => document.body.insertAdjacentHTML('afterbegin', html), { once: true });
  }
  renderLoader();

  function getBase() {
    const host = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (host.includes('github.io')) {
      if (path.includes('/al-ghunaimi-law-firm')) return '/Al-Ghunaimi-Law-Firm';
      if (path.includes('/al-ghoneimy-law-general')) return '/al-ghoneimy-law-general';
      return '/Al-Ghunaimi-Law-Firm';
    }
    return '';
  }

  function getPageUrl(page) {
    const base = getBase();
    const prefix = getPathPrefix();
    // file:// -> relative paths with prefix + .html
    if (isLocal) {
      if (page === 'home') return prefix + 'index.html';
      if (page.startsWith('services/')) {
        const slug = page.split('/')[1];
        return prefix + 'services/' + slug + '.html';
      }
      if (page.startsWith('articles/')) {
        const slug = page.split('/')[1];
        return prefix + 'articles/' + slug + '.html';
      }
      return prefix + page + '.html';
    }
    // http(s) -> base-aware absolute paths (Vercel root, GitHub Pages subfolder)
    if (page === 'home') return (base || '') + '/';
    if (page.startsWith('services/')) {
      const slug = page.split('/')[1];
      return base + '/services/' + slug;
    }
    if (page.startsWith('articles/')) {
      const slug = page.split('/')[1];
      return base + '/articles/' + slug;
    }
    return base + '/' + page;
  }

  function getCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('about')) return 'about';
    if (path.includes('services')) {
      if (path.includes('inheritance') || path.includes('real-estate') || path.includes('criminal') || path.includes('family') || path.includes('corporate') || path.includes('contracts')) {
        return 'services-detail';
      }
      return 'services';
    }
    if (path.includes('articles')) return 'articles';
    if (path.includes('contact')) return 'contact';
    if (path.includes('booking')) return 'booking';
    return 'home';
  }

  function isActive(page) {
    const current = getCurrentPage();
    if (page === 'home') return current === 'home';
    return current === page;
  }

  function navLink(page, label) {
    const active = isActive(page) ? ' active' : '';
    return `<a href="${getPageUrl(page)}" class="nav-link${active}" data-i18n-nav="${page}">${label}</a>`;
  }

  function renderHeader() {
    if (document.querySelector('.navbar')) return;
    const prefix = getPathPrefix();
    const html = `
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="nav-container">
        <a href="${getPageUrl('home')}" class="brand-logo" aria-label="Al-Ghonemy Law - Home">
          <img src="${prefix}img/logo_small.png" alt="Al-Ghonemy Law Logo" width="44" height="44" fetchpriority="high" decoding="async">
          <div class="brand-text">
            <span class="brand-title" data-i18n="brandTitle">مؤسسة الغنيمي</span>
            <span class="brand-sub" data-i18n="brandSub">للمحاماة والاستشارات القانونية</span>
          </div>
        </a>

        <ul class="nav-menu" role="menubar">
          <li class="nav-links-item">
            <ul class="nav-link-list" role="menubar">
              <li>${navLink('home', 'الرئيسية')}</li>
              <li>${navLink('about', 'عن المؤسسة وفريق العمل')}</li>
              <li>${navLink('services', 'الخدمات')}</li>
              <li>${navLink('articles', 'المقالات')}</li>
              <li>${navLink('contact', 'التواصل')}</li>
            </ul>
          </li>
          <li class="nav-actions-li">
            <div class="nav-actions">
              <div class="nav-actions-btns">
                <div class="lang-switcher-pill">
                  <button class="lang-btn" data-lang="ar" aria-label="العربية">ع</button>
                  <button class="lang-btn" data-lang="en" aria-label="English">EN</button>
                  <button class="lang-btn" data-lang="fr" aria-label="Français">FR</button>
                </div>
                <button class="toggle-btn theme-toggle-btn" aria-label="Toggle theme">
                  <i class="fas fa-sun"></i>
                </button>
              </div>
            </div>
          </li>
        </ul>

        <button class="mobile-toggle" id="mobile-toggle" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>`;
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  function renderFooter() {
    if (document.querySelector('.footer')) return;
    const prefix = getPathPrefix();
    const html = `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="${getPageUrl('home')}" class="brand-logo footer-brand-link" aria-label="Al-Ghonemy Law">
              <img src="${prefix}img/logo_small.png" alt="Al-Ghonemy Law Logo" width="48" height="48" loading="lazy" decoding="async">
              <div style="display:flex;flex-direction:column;">
                <span style="font-size:1.05rem;font-weight:900;color:var(--text-primary);line-height:1.25;" data-i18n="brandTitle">مؤسسة الغنيمي</span>
                <span style="font-size:0.68rem;color:var(--accent-gold);font-weight:600;letter-spacing:0.3px;" data-i18n="brandSub">للمحاماة والاستشارات القانونية</span>
              </div>
            </a>
            <p class="footer-tagline" data-i18n="footerDesc">مؤسسة الغنيمي للمحاماة والاستشارات القانونية — تمثيل قانوني متخصص أمام جميع المحاكم.</p>
          </div>
          <div class="footer-links">
            <h4 data-i18n="footerLinksTitle">روابط سريعة</h4>
            <ul>
              <li><a href="${getPageUrl('home')}" data-i18n="navHome">الرئيسية</a></li>
              <li><a href="${getPageUrl('about')}" data-i18n="navAbout">عن المؤسسة وفريق العمل</a></li>
              <li><a href="${getPageUrl('services')}" data-i18n="navPractices">الخدمات</a></li>
              <li><a href="${getPageUrl('articles')}" data-i18n="navInsights">المقالات</a></li>
              <li><a href="${getPageUrl('contact')}" data-i18n="navContact">التواصل</a></li>
              <li><a href="${getPageUrl('booking')}" data-i18n="navBookHeadquarters">حجز موعد</a></li>
            </ul>
          </div>
          <div class="footer-services">
            <h4 data-i18n="footerServicesTitle">خدماتنا</h4>
            <ul>
              <li><a href="${getPageUrl('services/criminal')}" data-i18n="service1">القضايا الجنائية</a></li>
              <li><a href="${getPageUrl('services/family')}" data-i18n="service2">قضايا الأسرة</a></li>
              <li><a href="${getPageUrl('services/inheritance')}" data-i18n="service3">الميراث والتركات</a></li>
              <li><a href="${getPageUrl('services/real-estate')}" data-i18n="service4">القضايا العقارية</a></li>
              <li><a href="${getPageUrl('services/corporate')}" data-i18n="service5">الشركات والقانون التجاري</a></li>
              <li><a href="${getPageUrl('services/contracts')}" data-i18n="service7">صياغة العقود</a></li>
            </ul>
          </div>
          <div class="footer-contact">
            <h4 data-i18n="footerContactTitle">تواصل معنا</h4>
            <ul>
              <li><i class="fas fa-map-marker-alt"></i> <a href="https://maps.app.goo.gl/dtBSfnvvPrr25nNKA" target="_blank" rel="noopener" data-i18n="footerAddress">مول الحجاز – 6 أكتوبر – الجيزة</a></li>
              <li><i class="fas fa-phone"></i> <a href="tel:+201003651199" dir="ltr">+20 100 365 1199</a></li>
              <li><i class="fab fa-whatsapp"></i> <a href="${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a></li>
              <li><i class="fas fa-envelope"></i> <a href="mailto:alghoneimy.Law@gmail.com" dir="ltr">alghoneimy.Law@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p data-i18n="footerRights">© 2026 مؤسسة الغنيمي للمحاماة. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function renderBackToTop() {
    document.body.insertAdjacentHTML('beforeend',
      '<button class="back-to-top" id="back-to-top" aria-label="Back to top"><i class="fas fa-chevron-up"></i></button>'
    );
  }

  function renderWhatsAppFloat() {
    document.body.insertAdjacentHTML('beforeend',
      `<a href="${WHATSAPP}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <i class="fab fa-whatsapp"></i>
      </a>`
    );
  }

  function renderBookingModal() {
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="booking-modal" role="dialog" aria-modal="true" aria-labelledby="bookingTitle">
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <div class="modal-header">
          <h3 id="bookingTitle" data-i18n="bookingTitle">احجز استشارتك القانونية</h3>
          <p data-i18n="bookingSubtitle">اختر الوقت المناسب وسنكون بانتظارك</p>
        </div>
        <form id="booking-form" novalidate>
          <div class="form-group">
            <label for="form-name" data-i18n="formName">الاسم الكامل</label>
            <input type="text" id="form-name" required data-i18n-placeholder="formNamePlaceholder" placeholder="أدخل اسمك">
          </div>
          <div class="form-group">
            <label for="form-phone" data-i18n="formPhone">رقم الهاتف</label>
            <input type="tel" id="form-phone" required placeholder="01XXXXXXXXX">
          </div>
          <div class="form-group">
            <label for="form-practice" data-i18n="formPractice">نوع الاستشارة</label>
            <select id="form-practice" required>
              <option value="" disabled selected data-i18n="formPractice">اختر نوع الاستشارة</option>
              <option value="جنائي" data-i18n="service1">قضايا جنائية</option>
              <option value="أسرة" data-i18n="service2">قضايا أسرة</option>
              <option value="ميراث" data-i18n="service3">ميراث وتركات</option>
              <option value="عقاري" data-i18n="service4">قضايا عقارية</option>
              <option value="شركات" data-i18n="service5">شركات وقانون تجاري</option>
              <option value="إلكتروني" data-i18n="service6">جرائم إلكترونية</option>
              <option value="عقود" data-i18n="service7">صياغة عقود</option>
              <option value="عمالي" data-i18n="service8">قضايا عمالية</option>
              <option value="تعويضات" data-i18n="service9">تعويضات وحوادث</option>
              <option value="استشارة" data-i18n="service10">استشارة قانونية</option>
            </select>
          </div>
          <div class="form-group">
            <label for="form-type" data-i18n="formType">نوع الحجز</label>
            <select id="form-type">
              <option value="مقر المؤسسة" data-i18n="formTypeOffice">في مقر المؤسسة</option>
              <option value="أونلاين" data-i18n="formTypeOnline">استشارة أونلاين</option>
              <option value="مكالمة هاتفية" data-i18n="formTypeCall">مكالمة هاتفية</option>
            </select>
          </div>
          <div class="form-group">
            <label for="form-date" data-i18n="formDate">التاريخ المفضل</label>
            <input type="date" id="form-date">
          </div>
          <div class="form-group">
            <label for="form-notes" data-i18n="formNotes">ملاحظات إضافية</label>
            <textarea id="form-notes" rows="3" data-i18n-placeholder="formNotesPlaceholder" placeholder="أي تفاصيل إضافية..."></textarea>
          </div>
          <button type="submit" class="btn-gold btn-full" data-i18n="btnSubmitBooking">إرسال الطلب</button>
        </form>
      </div>
    </div>`);
  }

  function renderArticleModal() {
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="article-modal" role="dialog" aria-modal="true">
      <div class="modal-content modal-article">
        <button class="modal-close" aria-label="Close">&times;</button>
        <div class="article-modal-header">
          <span class="article-modal-cat" id="article-modal-cat"></span>
          <span class="article-modal-date" id="article-modal-date"></span>
        </div>
        <h2 id="article-modal-title"></h2>
        <div class="article-modal-body" id="article-modal-body"></div>
        <div class="article-modal-cta">
          <p data-i18n="articleCTA">هل تحتاج استشارة قانونية بخصوص هذا الموضوع؟</p>
          <a href="${WHATSAPP}?text=${encodeURIComponent('مرحباً، أحتاج استشارة قانونية')} " target="_blank" rel="noopener" class="btn-gold" data-i18n="heroCtaOnline">تواصل واتساب</a>
        </div>
      </div>
    </div>`);
  }

  function renderModals() {
    renderBookingModal();
    renderArticleModal();
  }

  function initNavDataI18n() {
    document.querySelectorAll('[data-i18n-nav]').forEach(el => {
      const key = el.getAttribute('data-i18n-nav');
      const mapping = { home: 'navHome', about: 'navAbout', team: 'navTeam', services: 'navPractices', articles: 'navInsights', contact: 'navContact' };
      if (mapping[key]) el.setAttribute('data-i18n', mapping[key]);
    });
  }

  window.GhonemyComponents = {
    renderHeader,
    renderFooter,
    renderBackToTop,
    renderWhatsAppFloat,
    renderModals,
    initNavDataI18n,
    getCurrentPage,
    BASE,
    WHATSAPP
  };

  // Auto-render components on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    renderBackToTop();
    renderWhatsAppFloat();
    renderModals();
    initNavDataI18n();
  });
})();
