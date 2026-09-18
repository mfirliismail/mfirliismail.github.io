'use strict';

/* ==================== MOBILE MENU TOGGLE ==================== */
const sidebar = document.querySelector('.sidebar');
const burger = document.querySelector('.side-burger');

if (burger && sidebar) {
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = sidebar.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when clicking a nav link / cta
  sidebar.querySelectorAll('.side-link, .side-cta').forEach(el => {
    el.addEventListener('click', () => {
      sidebar.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when clicking outside sidebar
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target)) {
      sidebar.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Sidebar nav active state on scroll
const sections = document.querySelectorAll('section[id]');
const sideLinks = document.querySelectorAll('.side-link');
const setActive = () => {
  const y = window.scrollY + 120;
  let current = '';
  sections.forEach(s => {
    if (s.offsetTop <= y) current = s.id;
  });
  sideLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
};
window.addEventListener('scroll', setActive, { passive: true });
setActive();

/* ==================== SCROLL REVEAL ==================== */
// Auto-mark elements that should reveal on scroll
const revealSelectors = [
  '.section-pill',
  '.section-title',
  '.section-lede',
  '.section-year',
  '.process-lede',
  '.toolkit-lede',
  '.stat-banner',
  '.exp-card',
  '.contact-card',
  '.footer-block',
  '.hero-badge',
  '.hero-title'
];
revealSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
});

// Grid children — stagger via .reveal-group
const groupSelectors = [
  '.filter-row',
  '.project-grid',
  '.services-grid',
  '.process-grid',
  '.tool-grid',
  '.archive-grid',
  '.work-list'
];
groupSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach(group => {
    group.classList.add('reveal-group');
    Array.from(group.children).forEach(child => child.classList.add('reveal'));
  });
});

// IntersectionObserver — add .in when element enters viewport
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal, .reveal-group').forEach(el => io.observe(el));
