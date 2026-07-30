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

// Waitlist form (front-end only placeholder — no backend yet)
const waitlistForm = document.getElementById('waitlistForm');
const waitlistMsg = document.getElementById('waitlistMsg');

if (waitlistForm) {
  waitlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('waitlistEmail');
    const email = emailInput.value.trim();

    if (!email) return;

    waitlistMsg.textContent = "You're on the list. We'll be in touch.";
    waitlistForm.reset();
  });
}
