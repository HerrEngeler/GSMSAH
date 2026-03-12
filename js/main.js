/**
 * GSMS Absberg-Haundorf — Main JavaScript
 */

// === Mobile Navigation ===
(function () {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Mark active link
  const current = location.pathname.split('/').pop() || 'index.html';
  links.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// === Accordion ===
document.querySelectorAll('.accordion-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = btn.nextElementSibling;
    const open = btn.classList.toggle('open');
    body.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
});

// === Password Protected Gallery ===
(function () {
  const form      = document.getElementById('photoPasswordForm');
  const input     = document.getElementById('photoPassword');
  const errMsg    = document.getElementById('photoPasswordError');
  const gallery   = document.getElementById('photoGallery');
  const lockArea  = document.getElementById('lockArea');
  const logoutBtn = document.getElementById('galleryLogout');

  if (!form) return;

  // Simple SHA-256 password hash (password: "gsms-fotos")
  // SHA-256 of "gsms-fotos" — change this for production!
  const CORRECT_HASH = 'b2c49e5e5c3a7a3d4caed6b04d3892e1b8be4826bfdb7e47e1e2d6f1d80bea1e';

  async function sha256(msg) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(msg)
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function checkPassword(pw) {
    const hash = await sha256(pw);
    return hash === CORRECT_HASH;
  }

  // Check session storage
  if (sessionStorage.getItem('gsms_gallery_auth') === '1') {
    unlockGallery();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = input.value.trim();
    if (!pw) return;

    const ok = await checkPassword(pw);
    if (ok) {
      sessionStorage.setItem('gsms_gallery_auth', '1');
      errMsg.classList.remove('show');
      unlockGallery();
    } else {
      errMsg.classList.add('show');
      input.value = '';
      input.focus();
    }
  });

  function unlockGallery() {
    if (lockArea) lockArea.style.display = 'none';
    if (gallery)  gallery.classList.add('unlocked');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('gsms_gallery_auth');
      location.reload();
    });
  }
})();

// === Gallery Tabs ===
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.target;
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.gallery-panel').forEach(p => p.style.display = 'none');
    tab.classList.add('active');
    const panel = document.getElementById(target);
    if (panel) panel.style.display = 'grid';
  });
});

// Init first tab
const firstTab = document.querySelector('.gallery-tab');
if (firstTab) firstTab.click();

// === Smooth scroll for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === Animate elements on scroll ===
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .news-card, .quick-tile, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });
}
