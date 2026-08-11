document.addEventListener('DOMContentLoaded', () => {
  // State Management
  let currentLang = localStorage.getItem('ghonemy_lang') || 'ar';
  let currentTheme = localStorage.getItem('ghonemy_theme') || 'dark';

  // DOM Elements
  const langBtns = document.querySelectorAll('.lang-btn');
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // Modals
  const bookingModal = document.getElementById('booking-modal');
  const closeModalBtns = document.querySelectorAll('.modal-close');
  const bookingForm = document.getElementById('booking-form');

  // Initialize App
  initTheme(currentTheme);
  initLanguage(currentLang);
  initHeroCanvas();
  initScrollEffects();
  initScrollSpy();
  initRevealAnimations();
  initEscapeModal();
  initTypewriter();
  initStatsCounter();
  initBackToTop();
  initAdmin();

  // Multi-Language Pill Switcher Event Listeners
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      if (selectedLang && selectedLang !== currentLang) {
        currentLang = selectedLang;
        localStorage.setItem('ghonemy_lang', currentLang);
        initLanguage(currentLang);
      }
    });
  });

  // Theme Toggle Listener (Supports Desktop + Mobile Theme Buttons)
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ghonemy_theme', currentTheme);
      initTheme(currentTheme);
    });
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Close Mobile Menu on Nav Link or Action Click
  document.querySelectorAll('.nav-link, .nav-menu .btn-gold').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close Mobile Drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Auto-remove active drawer class on window resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && navMenu) {
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Modal Open Buttons
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetModalId = btn.getAttribute('data-open-modal');
      const targetModal = document.getElementById(targetModalId);
      if (!targetModal) return;

      const articleNum = btn.getAttribute('data-article');
      if (targetModalId === 'article-modal' && articleNum) {
        const lang = document.documentElement.lang;
        const t = translations[lang] || translations.ar;
        document.getElementById('article-modal-title').textContent = t[`article${articleNum}Title`] || '';
        document.getElementById('article-modal-cat').textContent = t[`article${articleNum}Cat`] || '';
        document.getElementById('article-modal-date').textContent = t[`article${articleNum}Date`] || '';
        document.getElementById('article-modal-body').innerHTML = t[`article${articleNum}Content`] || '';
      }

      const consultType = btn.getAttribute('data-consult-type');

      openModal(targetModal);

      if (targetModalId === 'booking-modal' && consultType) {
        const typeSelect = document.getElementById('form-type');
        if (typeSelect) typeSelect.value = consultType;
      }
    });
  });

  function openModal(modal) {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    modal.classList.add('active');
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarWidth + 'px';
    const firstInput = modal.querySelector('input, textarea, select, button');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Modal Close Buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close Modal on Overlay Click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  });

  // Focus Trap inside open modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const activeModal = document.querySelector('.modal.active');
    if (!activeModal) return;
    const focusables = activeModal.querySelectorAll('input, textarea, select, button, a[href]');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Booking Form Submission -> WhatsApp Link Generation
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      const phone = document.getElementById('form-phone').value;
      const practice = document.getElementById('form-practice').value;
      const date = document.getElementById('form-date').value;
      const type = document.getElementById('form-type').value;
      const notes = document.getElementById('form-notes').value;

      const waMsg = `*طلب حجز استشارة قانونية*\n` +
                    `*مؤسسة الغنيمي للمحاماة – مول الحجاز، 6 أكتوبر*\n\n` +
                    `• *الاسم:* ${name}\n` +
                    `• *الهاتف/الواتساب:* ${phone}\n` +
                    `• *الخدمة المطلوبة:* ${practice}\n` +
                    `• *الموعد المفضل:* ${date || 'في أقرب وقت'}\n` +
                    `• *نوع الاستشارة:* ${type}\n` +
                    `• *ملخص الموضوع:* ${notes || 'لا يوجد'}`;

      const encodedMsg = encodeURIComponent(waMsg);
      window.open(`https://wa.me/201126118276?text=${encodedMsg}`, '_blank');
      
      closeAllModals();
      bookingForm.reset();
    });
  }

  // Language Engine
  function initLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update Lang Pill Buttons Active State
    langBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Translate DOM elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Update Meta Title
    if (translations[lang] && translations[lang].metaTitle) {
      document.title = translations[lang].metaTitle;
    }

    renderAdminArticles();
  }

  // Theme Engine
  function initTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }

  // Scroll Navbar Effect
  function initScrollEffects() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Scroll Spy – Active Nav Link on Scroll
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // Scroll Reveal Animations for Sections & Cards
  function initRevealAnimations() {
    const els = document.querySelectorAll('.section-badge, .section-title, .pillar-card, .partner-card, .practice-card, .article-card, .stat-item, .contact-item');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });

    // Fallback: if IntersectionObserver fails, show all after 3s
    setTimeout(() => {
      els.forEach(el => {
        if (!el.classList.contains('active')) el.classList.add('active');
      });
    }, 3000);
  }

  // Close Modal on Escape Key
  function initEscapeModal() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
      }
    });
  }

  // Typewriter Effect – Cycles Through All 3 Languages
  function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const phrases = {
      ar: ['نحو عدالة ... بثقة ... لنتائج تدوم', 'الأمان القانوني', 'مؤسسة الغنيمي للمحاماة'],
      en: ['Towards Justice... With Confidence... For Lasting Results', 'Absolute Legal Security', 'Al-Ghonemy Law Firm'],
      fr: ['Vers la Justice... Avec Confiance... Pour des Résultats Durables', 'Sécurité Juridique Absolue', 'Cabinet Al-Ghonemy']
    };

    let idx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
      const lang = document.documentElement.lang;
      const currentPhrases = phrases[lang] || phrases.ar;
      const currentText = currentPhrases[idx];

      if (isDeleting) {
        el.textContent = currentText.substring(0, charIdx - 1);
        charIdx--;
      } else {
        el.textContent = currentText.substring(0, charIdx + 1);
        charIdx++;
      }

      if (!isDeleting && charIdx === currentText.length) {
        isDeleting = true;
        setTimeout(type, 2200);
        return;
      }

      if (isDeleting && charIdx === 0) {
        isDeleting = false;
        idx = (idx + 1) % currentPhrases.length;
        setTimeout(type, 400);
        return;
      }

      setTimeout(type, isDeleting ? 15 : 40);
    }

    type();
  }

  // Animated Stats Counter
  function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number[data-value]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-value'));
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1800;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target + suffix;
            }
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  // Back to Top Button
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Dynamic Ambient Canvas Animation (Geometric Gold Lines)
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.remove();
      return;
    }
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animId = null;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor(width / 25), 45);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const particleColor = isDark ? 'rgba(212, 175, 55, ' : 'rgba(184, 134, 11, ';

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor + '0.6)';
        ctx.fill();

        for (let j = i + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = particleColor + (1 - dist / 130) * 0.15 + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    }

    // Pause animation when hero is not visible
    const hero = document.querySelector('.hero');
    let heroVisible = true;
    if (hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) {
          if (!animId) animate();
        } else {
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
      }, { threshold: 0.1 });
      observer.observe(hero);
    } else {
      animate();
    }

    // Pause animation when tab is hidden (saves CPU/battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
      } else {
        if (!animId && heroVisible) animate();
      }
    });
  }

  // ════════════════════════════════════════════
  // ADMIN PANEL
  // ════════════════════════════════════════════

  const ADMIN_KEY = 'ghonemy_admin_articles';
  const ADMIN_PASS = 'admin123';
  let adminClickCount = 0;

  function initAdmin() {
    const footerLogo = document.querySelector('.footer-brand .brand-logo');
    if (footerLogo) {
      footerLogo.addEventListener('click', (e) => {
        if (!e.target.closest('img')) return;
        adminClickCount++;
        if (adminClickCount >= 5) {
          adminClickCount = 0;
          openModal(document.getElementById('admin-login-modal'));
        }
      });
    }

    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPassInput = document.getElementById('admin-pass');
    const adminArticleForm = document.getElementById('admin-article-form');

    if (adminLoginBtn) adminLoginBtn.addEventListener('click', checkAdminPass);
    if (adminPassInput) adminPassInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAdminPass();
    });

    if (adminArticleForm) adminArticleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addAdminArticle();
    });

    renderAdminArticles();
    renderAdminList();
  }

  function checkAdminPass() {
    const passInput = document.getElementById('admin-pass');
    const errorEl = document.getElementById('admin-pass-error');
    if (!passInput) return;
    const pass = passInput.value;
    if (pass === ADMIN_PASS) {
      passInput.value = '';
      if (errorEl) errorEl.style.display = 'none';
      closeAllModals();
      openModal(document.getElementById('admin-panel-modal'));
      renderAdminList();
    } else {
      if (errorEl) errorEl.style.display = 'block';
    }
  }

  function getAdminArticles() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY)) || [];
    } catch { return []; }
  }

  function saveAdminArticles(articles) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(articles));
  }

  function addAdminArticle() {
    const titleEl = document.getElementById('admin-title');
    const catEl = document.getElementById('admin-cat');
    const dateEl = document.getElementById('admin-date');
    const descEl = document.getElementById('admin-desc');
    const contentEl = document.getElementById('admin-content');
    if (!titleEl || !catEl || !dateEl || !descEl || !contentEl) return;
    
    const title = titleEl.value.trim();
    const cat = catEl.value.trim();
    const date = dateEl.value;
    const desc = descEl.value.trim();
    const content = contentEl.value.trim();

    if (!title || !cat || !date || !desc || !content) return;

    const articles = getAdminArticles();
    const id = Date.now();
    articles.unshift({ id, title, cat, date, desc, content });
    saveAdminArticles(articles);

    document.getElementById('admin-article-form').reset();
    renderAdminArticles();
    renderAdminList();
  }

  function deleteAdminArticle(id) {
    let articles = getAdminArticles();
    articles = articles.filter(a => a.id !== id);
    saveAdminArticles(articles);
    renderAdminArticles();
    renderAdminList();
  }

  function renderAdminList() {
    const articles = getAdminArticles();
    const list = document.getElementById('admin-articles-list');
    const count = document.getElementById('admin-count');
    const empty = document.getElementById('admin-empty-msg');
    if (!list || !count || !empty) return;
    count.textContent = articles.length;
    list.innerHTML = '';

    if (articles.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    articles.forEach(a => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);padding:10px 14px;border-radius:var(--radius-sm);border:1px solid var(--border-color);';
      div.innerHTML = `<div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);">${a.cat} · ${a.date}</div>
      </div>
      <button class="admin-del-btn" data-id="${a.id}" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:1.1rem;flex-shrink:0;padding:4px 8px;" title="حذف">🗑</button>`;
      list.appendChild(div);

      div.querySelector('.admin-del-btn').addEventListener('click', () => {
        if (confirm('حذف المقال؟')) deleteAdminArticle(a.id);
      });
    });
  }

  function renderAdminArticles() {
    const articles = getAdminArticles();
    const grid = document.querySelector('.insights-grid');
    if (!grid || articles.length === 0) return;

    const existingAdmin = grid.querySelectorAll('.admin-article-card');
    existingAdmin.forEach(el => el.remove());

    articles.forEach(a => {
      const card = document.createElement('div');
      card.className = 'article-card admin-article-card';
      card.innerHTML = `<div class="article-body">
        <div class="article-meta">
          <span class="article-cat">${escHtml(a.cat)}</span>
          <span class="article-date">${a.date}</span>
        </div>
        <h3 class="article-title">${escHtml(a.title)}</h3>
        <p class="article-desc">${escHtml(a.desc)}</p>
        <button class="btn-outline admin-article-btn" data-id="${a.id}">اقرأ المقال كاملاً</button>
      </div>`;
      grid.appendChild(card);
    });

    document.querySelectorAll('.admin-article-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const articles = getAdminArticles();
        const article = articles.find(a => a.id === id);
        if (!article) return;

        document.getElementById('article-modal-title').textContent = article.title;
        document.getElementById('article-modal-cat').textContent = article.cat;
        document.getElementById('article-modal-date').textContent = article.date;
        document.getElementById('article-modal-body').innerHTML = article.content;
        openModal(document.getElementById('article-modal'));
      });
    });
  }

  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
