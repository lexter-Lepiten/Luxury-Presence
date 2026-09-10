const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav scroll state + mobile menu
  const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
  menuBtn.addEventListener('click', () => {
    header.classList.toggle('mobile-open');
  });
  document.querySelectorAll('nav.links a').forEach(a => {
    a.addEventListener('click', () => header.classList.remove('mobile-open'));
  });

  // Active nav link on scroll
  const navLinkEls = document.querySelectorAll('#navLinks a');
  const navSections = ['about','sell','buy','calculator','gallery','contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(a => a.classList.toggle('active', a.dataset.nav === entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  navSections.forEach(sec => navObserver.observe(sec));

  // Back to top
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 700);
  });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Reveal on scroll (single orchestrated pattern, not per-card)
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  revealEls.forEach(el => io.observe(el));

  // ---- Hero parallax ----
  const heroPhoto = document.querySelector('.hero-photo');
  const heroEl = document.querySelector('.hero');
  if (heroPhoto && heroEl && !prefersReducedMotion) {
    let ticking = false;
    function updateParallax(){
      const y = window.scrollY;
      const heroHeight = heroEl.offsetHeight;
      if (y < heroHeight) {
        heroPhoto.style.transform = `translateY(${y * 0.18}px)`;
      }
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    });
  }

  // ---- Animated stat counters ----
  const countEls = document.querySelectorAll('.count-up');
  function animateCount(el){
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (prefersReducedMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => countObserver.observe(el));

  // ---- Gallery filter ----
  const filterBtns = document.querySelectorAll('.gallery-filter button');
  const galleryFigures = document.querySelectorAll('#galleryGrid figure');
  const galleryCountEl = document.getElementById('galleryCount');
  function updateGalleryCount(cat){
    const visible = Array.from(galleryFigures).filter(fig => cat === 'all' || fig.dataset.category === cat);
    if (!galleryCountEl) return;
    const catLabels = { all: 'Photos', community: 'Community', homes: 'Homes', interiors: 'Interiors' };
    galleryCountEl.textContent = visible.length + ' ' + (catLabels[cat] || 'Photos');
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

  // ---- Featured listing tilt ----
  const featuredMedia = document.getElementById('featuredMedia');
  if (featuredMedia && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    featuredMedia.addEventListener('mousemove', (e) => {
      const rect = featuredMedia.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      featuredMedia.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    featuredMedia.addEventListener('mouseleave', () => {
      featuredMedia.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
    });
  }

  // ---- Gallery lightbox ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCap');
  const lightboxCount = document.getElementById('lightboxCount');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const allFigures = Array.from(document.querySelectorAll('#galleryGrid figure'));
  let currentIndex = 0;

  function openLightboxAt(index){
    const visibleFigures = allFigures.filter(f => !f.classList.contains('hidden'));
    if (!visibleFigures.length) return;
    currentIndex = ((index % visibleFigures.length) + visibleFigures.length) % visibleFigures.length;
    const fig = visibleFigures[currentIndex];
    const img = fig.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = fig.dataset.cap || '';
    lightboxCount.textContent = (currentIndex + 1) + ' / ' + visibleFigures.length;
    lightbox.dataset.visibleCount = visibleFigures.length;
    lightbox.classList.add('open');
  }

  allFigures.forEach((fig, i) => {
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

  // ---- Mortgage calculator ----
  const calcPrice = document.getElementById('calcPrice');
  const calcDown = document.getElementById('calcDown');
  const calcRate = document.getElementById('calcRate');
  const calcPriceOut = document.getElementById('calcPriceOut');
  const calcDownOut = document.getElementById('calcDownOut');
  const calcRateOut = document.getElementById('calcRateOut');
  const calcResult = document.getElementById('calcResult');
  const termBtns = document.querySelectorAll('.term-btn');
  let loanTermYears = 30;

  function money(n){ return '$' + Math.round(n).toLocaleString(); }

  function updateCalc(){
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

  // ---- Testimonial carousel ----
  const testiSlideEls = document.querySelectorAll('.testi-slide');
  const testiDotEls = document.querySelectorAll('.testi-dot');
  let testiIndex = 0;
  function showTesti(i){
    testiSlideEls.forEach((s, idx) => s.classList.toggle('active', idx === i));
    testiDotEls.forEach((d, idx) => d.classList.toggle('active', idx === i));
    testiIndex = i;
  }
  testiDotEls.forEach(dot => {
    dot.addEventListener('click', () => showTesti(parseInt(dot.dataset.i, 10)));
  });
  setInterval(() => { showTesti((testiIndex + 1) % testiSlideEls.length); }, 6000);

  // ---- Contact form (front-end only) ----
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formMsg.textContent = "Thanks — Marci's office will get back to you shortly.";
    form.reset();
  });