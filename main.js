/* ==========================================================================
   Nexora — interactions (vanilla JS)
   - Lucide icon rendering
   - Sticky navbar state + active link highlighting
   - Mobile menu toggle
   - Scroll reveal (IntersectionObserver)
   - Animated statistic counters
   - Pricing billing toggle
   - FAQ accordion
   - CTA form validation
   - Back-to-top button
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Icons ---------- */
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ---------- Navbar ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('is-scrolled', y > 10);
    backToTop.classList.toggle('is-visible', y > 600);

    // Active link highlighting
    const offset = y + 120;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= offset) current = section;
    }
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current.id);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = menuToggle.querySelector('.icon-open');
  const iconClose = menuToggle.querySelector('.icon-close');

  function setMenu(open) {
    mobileMenu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
  }

  menuToggle.addEventListener('click', () => {
    setMenu(!mobileMenu.classList.contains('is-open'));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false);
  });

  // Close the mobile menu if the viewport grows to desktop size
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Animated counters ---------- */
  function formatNumber(value, decimals) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1600;

    if (prefersReducedMotion) {
      el.textContent = prefix + formatNumber(target, decimals) + suffix;
      return;
    }

    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = prefix + formatNumber(target * eased, decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Pricing billing toggle ---------- */
  const billingButtons = document.querySelectorAll('.billing-btn');
  const prices = document.querySelectorAll('.price');

  billingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      const period = btn.dataset.billing;

      billingButtons.forEach((b) => b.classList.toggle('is-active', b === btn));

      prices.forEach((price) => {
        price.classList.add('is-switching');
        setTimeout(() => {
          price.textContent = price.dataset[period];
          price.classList.remove('is-switching');
        }, 200);
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');

  function closeItem(item) {
    const panel = item.querySelector('.faq-panel');
    const trigger = item.querySelector('.faq-trigger');
    panel.style.maxHeight = '0px';
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openItem(item) {
    const panel = item.querySelector('.faq-panel');
    const trigger = item.querySelector('.faq-trigger');
    panel.style.maxHeight = panel.scrollHeight + 'px';
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach(closeItem);
      if (!isOpen) openItem(item);
    });
  });

  // Keep open panels sized correctly if the viewport resizes
  window.addEventListener('resize', () => {
    document.querySelectorAll('.faq-item.is-open .faq-panel').forEach((panel) => {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------- CTA form ---------- */
  const ctaForm = document.getElementById('cta-form');
  const ctaEmail = document.getElementById('cta-email');
  const ctaMessage = document.getElementById('cta-message');

  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = ctaEmail.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    if (!valid) {
      ctaMessage.textContent = 'Please enter a valid work email address.';
      ctaMessage.className = 'mt-3 h-5 text-sm text-red-600';
      ctaEmail.focus();
      return;
    }

    const button = ctaForm.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Creating account…';

    // Simulated request — replace with a real API call when wiring up a backend
    setTimeout(() => {
      ctaMessage.textContent = "You're in! Check " + email + ' for your login link.';
      ctaMessage.className = 'mt-3 h-5 text-sm text-emerald-600';
      ctaForm.reset();
      button.disabled = false;
      button.textContent = 'Get Started';
    }, 900);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
