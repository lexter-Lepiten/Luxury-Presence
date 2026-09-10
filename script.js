const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nav scroll state + mobile menu ---------- */
const header = document.getElementById('siteHeader');
const menuBtn = document.getElementById('menuBtn');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});
menuBtn.addEventListener('click', () => {
  const open = header.classList.toggle('mobile-open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.querySelectorAll('nav.links a').forEach(a => {
  a.addEventListener('click', () => {
    header.classList.remove('mobile-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Active nav link on scroll ---------- */
const navLinkEls = document.querySelectorAll('#navLinks a');
const navSections = ['overview', 'gallery', 'calculator', 'agent', 'contact']
  .map(id => document.getElementById(id)).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(a => a.classList.toggle('active', a.dataset.nav === entry.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
navSections.forEach(sec => navObserver.observe(sec));

/* ---------- Back to top ---------- */
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 700);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Reveal on scroll (single orchestrated pattern) ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.2 });
revealEls.forEach(el => io.observe(el));

/* ---------- Detail tabs (Overview / Amenities / Floor plan / Neighborhood) ---------- */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const tabIndicator = document.getElementById('tabIndicator');
const tabNav = document.querySelector('.tab-nav');

function moveIndicator(btn) {
  if (!btn || !tabIndicator || !tabNav) return;
  const navRect = tabNav.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  tabIndicator.style.left = (btnRect.left - navRect.left) + 'px';
  tabIndicator.style.width = btnRect.width + 'px';
}

function activateTab(tabName) {
  tabBtns.forEach(b => {
    const active = b.dataset.tab === tabName;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active) moveIndicator(b);
  });
  tabPanels.forEach(p => {
    const active = p.id === 'panel-' + tabName;
    p.classList.toggle('active', active);
    p.hidden = !active;
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});
window.addEventListener('resize', () => {
  const active = document.querySelector('.tab-btn.active');
  moveIndicator(active);
});
// Initialize indicator position once fonts/layout settle
window.addEventListener('load', () => moveIndicator(document.querySelector('.tab-btn.active')));
requestAnimationFrame(() => moveIndicator(document.querySelector('.tab-btn.active')));

/* ---------- Gallery filter ---------- */
const filterBtns = document.querySelectorAll('.gallery-filter button');
const galleryFigures = document.querySelectorAll('#galleryGrid figure');
const galleryCountEl = document.getElementById('galleryCount');

function updateGalleryCount(cat) {
  const visible = Array.from(galleryFigures).filter(fig => cat === 'all' || fig.dataset.category === cat);
  if (!galleryCountEl) return;
  const catLabels = { all: 'photos', community: 'community photos', homes: 'exterior photos', interiors: 'interior photos' };
  galleryCountEl.textContent = visible.length + ' ' + (catLabels[cat] || 'photos');
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    galleryFigures.forEach(fig => {
      const show = cat === 'all' || fig.dataset.category === cat;
      fig.classList.toggle('hidden', !show);
    });
    updateGalleryCount(cat);
  });
});
updateGalleryCount('all');

/* ---------- Gallery lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCap');
const lightboxCount = document.getElementById('lightboxCount');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const allFigures = Array.from(document.querySelectorAll('#galleryGrid figure'));
let currentIndex = 0;

function openLightboxAt(index) {
  const visibleFigures = allFigures.filter(f => !f.classList.contains('hidden'));
  if (!visibleFigures.length) return;
  currentIndex = ((index % visibleFigures.length) + visibleFigures.length) % visibleFigures.length;
  const fig = visibleFigures[currentIndex];
  const img = fig.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCap.textContent = fig.dataset.cap || '';
  lightboxCount.textContent = (currentIndex + 1) + ' / ' + visibleFigures.length;
  lightbox.classList.add('open');
}

allFigures.forEach((fig) => {
  fig.addEventListener('click', () => {
    const visibleFigures = allFigures.filter(f => !f.classList.contains('hidden'));
    openLightboxAt(visibleFigures.indexOf(fig));
  });
});

document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); openLightboxAt(currentIndex - 1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); openLightboxAt(currentIndex + 1); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') lightbox.classList.remove('open');
  if (e.key === 'ArrowLeft') openLightboxAt(currentIndex - 1);
  if (e.key === 'ArrowRight') openLightboxAt(currentIndex + 1);
});

/* ---------- Mortgage calculator ---------- */
const calcPrice = document.getElementById('calcPrice');
const calcDown = document.getElementById('calcDown');
const calcRate = document.getElementById('calcRate');
const calcPriceOut = document.getElementById('calcPriceOut');
const calcDownOut = document.getElementById('calcDownOut');
const calcRateOut = document.getElementById('calcRateOut');
const calcResult = document.getElementById('calcResult');
const termBtns = document.querySelectorAll('.term-btn');
let loanTermYears = 30;

function money(n) { return '$' + Math.round(n).toLocaleString(); }

function updateCalc() {
  const price = parseFloat(calcPrice.value);
  const downPct = parseFloat(calcDown.value);
  const rate = parseFloat(calcRate.value);
  const downAmt = price * (downPct / 100);
  const principal = price - downAmt;
  const monthlyRate = (rate / 100) / 12;
  const numPayments = loanTermYears * 12;

  let payment;
  if (monthlyRate === 0) {
    payment = principal / numPayments;
  } else {
    payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  calcPriceOut.textContent = money(price);
  calcDownOut.textContent = downPct + '% · ' + money(downAmt);
  calcRateOut.textContent = rate + '%';
  calcResult.textContent = money(payment) + '/mo';
}

[calcPrice, calcDown, calcRate].forEach(el => el.addEventListener('input', updateCalc));
termBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    termBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loanTermYears = parseInt(btn.dataset.term, 10);
    updateCalc();
  });
});
updateCalc();

/* ---------- Testimonial carousel ---------- */
const testiSlideEls = document.querySelectorAll('.testi-slide');
const testiDotEls = document.querySelectorAll('.testi-dot');
let testiIndex = 0;
let testiTimer = null;

function showTesti(i) {
  testiSlideEls.forEach((s, idx) => s.classList.toggle('active', idx === i));
  testiDotEls.forEach((d, idx) => d.classList.toggle('active', idx === i));
  testiIndex = i;
}
function startTestiAutoplay() {
  if (prefersReducedMotion) return;
  testiTimer = setInterval(() => { showTesti((testiIndex + 1) % testiSlideEls.length); }, 6000);
}
testiDotEls.forEach(dot => {
  dot.addEventListener('click', () => {
    showTesti(parseInt(dot.dataset.i, 10));
    if (testiTimer) { clearInterval(testiTimer); startTestiAutoplay(); }
  });
});
startTestiAutoplay();

/* ---------- Contact form (front-end only) ---------- */
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.textContent = "Thanks — Marci's office will get back to you shortly.";
  form.reset();
});