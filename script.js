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
    });
  }

  // Close Mobile Menu on Nav Link or Action Click
  document.querySelectorAll('.nav-link, .nav-menu .btn-gold').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
    });
  });

  // Close Mobile Drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    }
  });

  // Auto-remove active drawer class on window resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && navMenu) {
      navMenu.classList.remove('active');
    }
  });

  // Modal Open Buttons
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetModalId = btn.getAttribute('data-open-modal');
      const targetModal = document.getElementById(targetModalId);
      if (targetModal) {
        targetModal.classList.add('active');
      }
    });
  });

  // Modal Close Buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
  });

  // Close Modal on Overlay Click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
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
      
      bookingModal.classList.remove('active');
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

  // Dynamic Ambient Canvas Animation (Geometric Gold Lines)
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
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
    if (hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (!animId) animate();
        } else {
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
      }, { threshold: 0.1 });
      observer.observe(hero);
    } else {
      animate();
    }
  }
});
