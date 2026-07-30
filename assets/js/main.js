// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

// Readiness gauge fill (circular progress)
const rgFill = document.querySelector('.rg-fill');
if (rgFill) {
  const value = parseFloat(rgFill.dataset.value || '0');
  const circumference = 2 * Math.PI * 86; // r=86
  const offset = circumference * (1 - value / 100);
  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        rgFill.style.strokeDashoffset = String(offset);
        gaugeObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  gaugeObserver.observe(rgFill);
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((open) => open.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Waitlist forms (front-end only placeholder — no backend yet)
function wireWaitlistForm(formId, msgId, resetForm = true) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value.trim()) return;
    const msg = msgId ? document.getElementById(msgId) : null;
    if (msg) {
      msg.textContent = "You're on the list. We'll be in touch.";
    }
    if (resetForm) form.reset();
  });
}

wireWaitlistForm('waitlistForm', 'waitlistMsg');
wireWaitlistForm('footerForm', null);
