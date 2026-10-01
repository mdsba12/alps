/* ============================================================
   ANGELINE LEE — script.js   (clean rewrite)
   ============================================================ */
(function () {
  'use strict';

  const html = document.documentElement;

  /* ── 1. PALETTE GRADIENTS ──────────────────────────────── */
  const GRADIENTS = {
    prussian: 'linear-gradient(135deg,#023047,#ffb703)',
    candy:    'linear-gradient(135deg,#355070,#e56b6f)',
    cyber:    'linear-gradient(135deg,#00296b,#fdc500)',
    midnight: 'linear-gradient(135deg,#084c61,#db3a34)',
  };

  /* ── 2. APPLY THEME ────────────────────────────────────── */
  function applyTheme(t) {
    html.dataset.theme = t;
    localStorage.setItem('al-theme', t);
    var lbl = document.getElementById('themeLabel');
    if (lbl) lbl.textContent = t === 'dark' ? 'Dark' : 'Light';
  }

  /* ── 3. APPLY PALETTE ──────────────────────────────────── */
  function applyPalette(p) {
    html.dataset.palette = p;
    localStorage.setItem('al-palette', p);
    var btn = document.getElementById('fabBtn');
    if (btn && GRADIENTS[p]) btn.style.background = GRADIENTS[p];
    document.querySelectorAll('.fab-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.palette === p);
    });
  }

  /* ── 4. INIT FROM STORAGE ──────────────────────────────── */
  applyTheme(localStorage.getItem('al-theme') || 'light');
  applyPalette(localStorage.getItem('al-palette') || 'prussian');

  /* ── 5. WAIT FOR DOM ───────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* ── 5a. REVEAL: make everything visible immediately,
            then add transitions for elements below the fold  */
    var revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach(function (el) {
      /* elements already in view on load → show instantly */
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 60) {
        el.style.transition = 'none';
        el.classList.add('visible');
        /* restore transition after paint */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.style.transition = ''; });
        });
      }
    });

    /* scroll-driven reveal for below-fold elements */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

      revealEls.forEach(function (el) {
        if (!el.classList.contains('visible')) io.observe(el);
      });
    } else {
      /* fallback for old browsers */
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ── 5b. THEME TOGGLE ──────────────────────────────── */
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
      });
    }

    /* ── 5c. FAB PALETTE ───────────────────────────────── */
    var fabBtn    = document.getElementById('fabBtn');
    var fabDrawer = document.getElementById('fabDrawer');

    if (fabBtn && fabDrawer) {
      fabBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var opening = !fabDrawer.classList.contains('open');
        fabDrawer.classList.toggle('open', opening);
        fabBtn.style.transform = opening ? 'rotate(180deg) scale(1.05)' : '';
      });

      document.querySelectorAll('.fab-item').forEach(function (item) {
        item.addEventListener('click', function () {
          applyPalette(item.dataset.palette);
          fabDrawer.classList.remove('open');
          fabBtn.style.transform = '';
        });
      });

      document.addEventListener('click', function (e) {
        var fab = document.getElementById('fab');
        if (fab && !fab.contains(e.target)) {
          fabDrawer.classList.remove('open');
          fabBtn.style.transform = '';
        }
      });
    }

    /* ── 5d. MOBILE HAMBURGER ──────────────────────────── */
    var hamburger = document.getElementById('hamburger');
    var navMenu   = document.getElementById('navMenu');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
      });
      navMenu.querySelectorAll('.nav-link').forEach(function (l) {
        l.addEventListener('click', function () {
          hamburger.classList.remove('open');
          navMenu.classList.remove('open');
        });
      });
    }

    /* ── 5e. SCROLL: navbar shadow + progress bar ──────── */
    var navbar    = document.getElementById('navbar');
    var scrollBar = document.getElementById('scrollBar');

    function onScroll() {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
      if (scrollBar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        scrollBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── 5f. ACTIVE NAV LINK ───────────────────────────── */
    var sections = Array.from(document.querySelectorAll('section[id]'));
    var navLinks = document.querySelectorAll('.nav-link');

    if ('IntersectionObserver' in window && sections.length) {
      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            var match = document.querySelector('.nav-link[href="#' + entry.target.id + '"]');
            if (match) match.classList.add('active');
          }
        });
      }, { threshold: 0.35 });
      sections.forEach(function (s) { navIO.observe(s); });
    }

    /* ── 5g. MODAL SYSTEM ──────────────────────────────── */
    var overlay  = document.getElementById('overlay');
    var mcontent = document.getElementById('mcontent');
    var mclose   = document.getElementById('mclose');
    var mtpls    = document.getElementById('mtpls');

    function openModal(id) {
      if (!mtpls || !overlay || !mcontent) return;
      var tpl = mtpls.querySelector('#' + id);
      if (!tpl) return;
      mcontent.innerHTML = tpl.innerHTML;
      /* animate skill bars */
      setTimeout(function () {
        mcontent.querySelectorAll('.mbar-fill').forEach(function (el) {
          el.style.width = (el.dataset.w || 0) + '%';
        });
      }, 80);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (mclose) mclose.focus();
    }

    function closeModal() {
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (mclose)   mclose.addEventListener('click', closeModal);
    if (overlay)  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    document.querySelectorAll('[data-modal]').forEach(function (el) {
      el.addEventListener('click', function () { openModal(el.dataset.modal); });
    });

    /* ── 5h. SMOOTH SCROLL ─────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 72,
          behavior: 'smooth'
        });
      });
    });

    /* ── 5i. CHAR COUNTER ──────────────────────────────── */
    var ta  = document.getElementById('cmsg');
    var cc  = document.getElementById('ccount');
    var MAX = 500;
    if (ta && cc) {
      ta.addEventListener('input', function () {
        if (ta.value.length > MAX) ta.value = ta.value.slice(0, MAX);
        var n = ta.value.length;
        cc.textContent = n + ' / ' + MAX;
        cc.style.color = n >= MAX ? '#e74c3c' : '';
      });
    }

    /* ── 5j. CONTACT FORM ──────────────────────────────── */
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.fName.value.trim() || !form.lName.value.trim())
          return showToast('Please enter your full name.', 'error');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value))
          return showToast('Please enter a valid email.', 'error');
        if (!form.subject.value)
          return showToast('Please select a subject.', 'error');
        if (!form.message.value.trim())
          return showToast('Please write a message.', 'error');

        var btn = form.querySelector('.btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
        setTimeout(function () {
          showToast("Message sent! I'll reply within 24 hours.", 'success');
          form.reset();
          if (cc) cc.textContent = '0 / ' + MAX;
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }, 1600);
      });
    }

    /* ── 5k. FOOTER YEAR ───────────────────────────────── */
    var fy = document.getElementById('footCopy');
    if (fy) fy.textContent = '© ' + new Date().getFullYear() + ' Angeline Lee Pei Shih. All rights reserved.';

  }); /* end DOMContentLoaded */

  /* ── 6. TOAST HELPER ───────────────────────────────────── */
  function showToast(msg, type) {
    type = type || 'info';
    var existing = document.querySelector('.al-toast');
    if (existing) existing.remove();

    var icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    var colors = { success: '#1abc9c', error: '#e74c3c', info: '#3498db' };

    var el = document.createElement('div');
    el.className = 'al-toast';
    el.innerHTML = '<i class="fas fa-' + icons[type] + '"></i><span>' + msg + '</span>';
    Object.assign(el.style, {
      position: 'fixed', bottom: '90px', right: '24px',
      background: colors[type], color: '#fff',
      padding: '12px 18px', borderRadius: '12px',
      boxShadow: '0 6px 24px rgba(0,0,0,.28)',
      display: 'flex', alignItems: 'center', gap: '9px',
      fontSize: '.87rem', fontWeight: '600',
      fontFamily: 'Poppins,sans-serif',
      zIndex: '9999', maxWidth: '320px',
      opacity: '0', transform: 'translateY(10px)',
      transition: 'opacity .28s, transform .28s',
    });
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(function () { el.remove(); }, 300);
    }, 4000);
  }

})();
