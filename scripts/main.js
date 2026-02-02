/* ==========================================================================
   CHALK v2 — Main Script
   Vanilla ES6+. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     Theme Toggle
     ======================================================================== */

  const THEME_KEY = 'chalk-theme';
  const root = document.documentElement;

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const theme = getStoredTheme();
    applyTheme(theme);

    const toggleBtns = document.querySelectorAll('.theme-toggle');
    if (!toggleBtns.length) return;

    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
  }

  /* ========================================================================
     Scroll Reveal (IntersectionObserver)
     ======================================================================== */

  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .stagger');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ========================================================================
     Nav Scroll Effect
     ======================================================================== */

  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load in case page is already scrolled
    onScroll();
  }

  /* ========================================================================
     Mobile Navigation
     ======================================================================== */

  function initMobileNav() {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    const mobileLinks = mobileNav.querySelectorAll('a');

    function openNav() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    function toggleNav() {
      if (mobileNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    }

    hamburger.addEventListener('click', toggleNav);

    // Close on link click
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeNav();
        hamburger.focus();
      }
    });

    // Focus trap
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !mobileNav.classList.contains('open')) return;

      const focusable = mobileNav.querySelectorAll('a, button');
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ========================================================================
     Smooth Scroll for Anchor Links
     ======================================================================== */

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  /* ========================================================================
     Waitlist Form Handling — Google Sheets Integration
     ======================================================================== */

  const WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwSUcyqtgJC0wgdJPTqM9NnYAPVzxXS75qNqYIF1xmA-E9M9hjISXVVorQI1U2D8tKv1Q/exec';

  function submitToSheet(data) {
    return fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });
  }

  function initWaitlistForm() {
    const forms = document.querySelectorAll('.waitlist-form');
    if (!forms.length) return;

    forms.forEach((form) => {
      const existingSuccess = form.closest('section')
        ? form.closest('section').querySelector('.waitlist-success')
        : null;

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const sportSelect = form.querySelector('select[name="sport"]');
        const typeSelect = form.querySelector('select[name="athlete-type"]');
        const submitBtn = form.querySelector('button[type="submit"]');

        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) return;

        // Determine which page the submission is from
        const source = window.location.pathname.split('/').pop() || 'index.html';

        const payload = {
          email: email,
          sport: sportSelect ? sportSelect.value : '',
          type: typeSelect ? typeSelect.value : '',
          source: source,
        };

        // Loading state
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }

        submitToSheet(payload)
          .then(() => {
            // no-cors means we can't read the response, assume success
            if (existingSuccess) {
              form.style.display = 'none';
              existingSuccess.classList.add('active');
            } else {
              // Inline CTA form — replace with success message
              const wrapper = form.parentElement;
              form.remove();

              const success = document.createElement('div');
              success.className = 'waitlist-success';
              success.innerHTML = `
                <p style="color: var(--color-accent); font-weight: 600; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                  You're on the list.
                </p>
                <p style="color: var(--color-text-secondary); font-size: 14px; margin-top: 8px;">
                  We'll reach out to <strong style="color: var(--color-text);">${email}</strong> when it's time.
                </p>
              `;
              success.style.display = 'block';
              success.style.animation = 'fadeInUp 400ms ease forwards';
              wrapper.appendChild(success);
            }
          })
          .catch(() => {
            // Network error — restore button
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
            // Still show success UI since no-cors often triggers catch
            // even on successful submissions
            if (existingSuccess) {
              form.style.display = 'none';
              existingSuccess.classList.add('active');
            }
          });
      });
    });
  }

  /* ========================================================================
     Initialize Everything on DOM Ready
     ======================================================================== */

  function init() {
    initTheme();
    initNavScroll();
    initMobileNav();
    initSmoothScroll();
    initScrollReveal();
    initWaitlistForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
