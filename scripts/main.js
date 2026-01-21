/* ==========================================================================
   Arete - Main Scripts
   ========================================================================== */

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // Navigation scroll behavior
  // --------------------------------------------------------------------------
  const nav = document.querySelector('.nav');

  if (nav) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
  }

  // --------------------------------------------------------------------------
  // Smooth scroll for anchor links
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // Form submission (placeholder - connect to your backend)
  // --------------------------------------------------------------------------
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = this.querySelector('input[type="email"]');
      if (email && email.value) {
        // TODO: Connect to your email collection backend
        console.log('Email submitted:', email.value);

        // Simple feedback
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.disabled = true;

        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          email.value = '';
        }, 2000);
      }
    });
  });

})();
