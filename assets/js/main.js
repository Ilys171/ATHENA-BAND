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

// Staggered joint-label entrance in the body map diagram
const bodyDiagram = document.querySelector('.body-diagram');
if (bodyDiagram) {
  const joints = bodyDiagram.querySelectorAll('.joint');
  const bodyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        joints.forEach((joint) => {
          const delay = parseInt(joint.dataset.stagger || '0', 10) * 120;
          setTimeout(() => joint.classList.add('in-view'), delay);
        });
        bodyObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  bodyObserver.observe(bodyDiagram);
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

// ---------- Gallery ----------
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  const items = Array.from(galleryGrid.querySelectorAll('.g-item'));
  const filters = document.querySelectorAll('.g-filter');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep every video silent, whatever the browser or the user tries.
  const forceMute = (v) => {
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.addEventListener('volumechange', () => { if (!v.muted || v.volume) { v.muted = true; v.volume = 0; } });
  };
  galleryGrid.querySelectorAll('video').forEach(forceMute);

  // Counts on filter chips
  document.querySelectorAll('[data-count]').forEach((el) => {
    const cat = el.dataset.count;
    el.textContent = cat === 'all' ? items.length : items.filter((i) => i.dataset.cat === cat).length;
  });

  const visibleItems = () => items.filter((i) => !i.classList.contains('is-hidden'));

  const applyFilter = (filter) => {
    items.forEach((item) => item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.cat !== filter));
  };

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.dataset.filter);
    });
  });

  // Play muted clips only while they're on screen
  if ('IntersectionObserver' in window && !reduceMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) { v.muted = true; v.play().catch(() => {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    galleryGrid.querySelectorAll('video').forEach((v) => videoObserver.observe(v));
  }

  // Lightbox
  const lb = document.getElementById('lightbox');
  document.body.appendChild(lb); // escape the section's stacking context so it sits above the header
  const lbMedia = lb.querySelector('.lb-media');
  const lbText = lb.querySelector('.lb-text');
  const lbCounter = lb.querySelector('.lb-counter');
  let lbList = [];
  let lbIndex = 0;
  let lastFocus = null;

  const renderLightbox = () => {
    const item = lbList[lbIndex];
    const src = item.querySelector('img, video');
    lbMedia.innerHTML = '';
    let el;
    if (src.tagName === 'VIDEO') {
      el = document.createElement('video');
      el.src = src.getAttribute('src').split('#')[0];
      el.loop = true;
      el.playsInline = true;
      el.autoplay = true;
      forceMute(el);
      el.setAttribute('aria-label', src.getAttribute('aria-label'));
      // No controls (they include a volume button); click to pause/resume.
      el.addEventListener('click', () => (el.paused ? el.play() : el.pause()));
    } else {
      el = document.createElement('img');
      el.src = src.getAttribute('src');
      el.alt = src.alt;
    }
    lbMedia.appendChild(el);
    if (el.tagName === 'VIDEO') el.play().catch(() => {});
    lbText.textContent = item.querySelector('figcaption').lastChild.textContent.trim();
    lbCounter.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbList.length).padStart(2, '0')}`;
  };

  const openLightbox = (item) => {
    lbList = visibleItems();
    lbIndex = Math.max(0, lbList.indexOf(item));
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('lb-open');
    renderLightbox();
    lb.querySelector('.lb-close').focus();
  };

  const closeLightbox = () => {
    lb.hidden = true;
    lbMedia.innerHTML = '';
    document.body.classList.remove('lb-open');
    if (lastFocus) lastFocus.focus();
  };

  const step = (dir) => {
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    renderLightbox();
  };

  items.forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
  });
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      // Keep focus inside the viewer
      const focusables = Array.from(lb.querySelectorAll('button'));
      const i = focusables.indexOf(document.activeElement);
      e.preventDefault();
      focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
    }
  });
}
