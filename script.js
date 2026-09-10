(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header + mobile navigation */
  const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 35);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuBtn && header && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = header.classList.toggle('mobile-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-lock', open);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('mobile-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open navigation');
        document.body.classList.remove('menu-lock');
      });
    });
  }

  /* Active navigation */
  const navAnchors = navLinks ? [...navLinks.querySelectorAll('a[data-nav]')] : [];
  const sections = navAnchors
    .map(a => document.getElementById(a.dataset.nav))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navAnchors.forEach(a => {
          a.classList.toggle(
            'active',
            a.dataset.nav === entry.target.id
          );
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  /* Reveal on scroll */
  const reveals = [...document.querySelectorAll('.reveal')];

  if (
    reducedMotion ||
    !('IntersectionObserver' in window)
  ) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    reveals.forEach(el => revealObserver.observe(el));
  }

  /* Count-up */
  const countEls = [...document.querySelectorAll('.count-up')];

  const money = value =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

  function animateCount(el) {
    const target = Number(el.dataset.target);

    if (!Number.isFinite(target)) return;

    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = Number(el.dataset.decimals || 0);

    if (reducedMotion) {
      el.textContent =
        `${prefix}${target.toFixed(decimals)}${suffix}`;
      return;
    }

    const start = performance.now();
    const duration = 1100;

    const tick = now => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      el.textContent =
        `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  if (countEls.length) {
    if (
      reducedMotion ||
      !('IntersectionObserver' in window)
    ) {
      countEls.forEach(animateCount);
    } else {
      const countObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            animateCount(entry.target);
            obs.unobserve(entry.target);
          });
        },
        {
          threshold: 0.55
        }
      );

      countEls.forEach(el =>
        countObserver.observe(el)
      );
    }
  }

  /* Mortgage calculator */
  const calcPrice = document.getElementById('calcPrice');
  const calcDown = document.getElementById('calcDown');
  const calcRate = document.getElementById('calcRate');

  const calcPriceOut =
    document.getElementById('calcPriceOut');

  const calcDownOut =
    document.getElementById('calcDownOut');

  const calcRateOut =
    document.getElementById('calcRateOut');

  const calcResult =
    document.getElementById('calcResult');

  const termBtns = [
    ...document.querySelectorAll('.term-btn')
  ];

  let termYears = 30;

  function runCalculator() {
    if (
      !calcPrice ||
      !calcDown ||
      !calcRate ||
      !calcResult
    ) {
      return;
    }

    const price = Number(calcPrice.value);
    const downPct = Number(calcDown.value);
    const rate = Number(calcRate.value);

    const downAmount =
      price * downPct / 100;

    const principal =
      Math.max(price - downAmount, 0);

    const monthlyRate =
      rate / 100 / 12;

    const payments =
      termYears * 12;

    const payment =
      monthlyRate === 0
        ? principal / payments
        : (
            principal *
            monthlyRate *
            Math.pow(
              1 + monthlyRate,
              payments
            )
          ) /
          (
            Math.pow(
              1 + monthlyRate,
              payments
            ) - 1
          );

    if (calcPriceOut) {
      calcPriceOut.textContent =
        money(price);
    }

    if (calcDownOut) {
      calcDownOut.textContent =
        `${downPct}% · ${money(downAmount)}`;
    }

    if (calcRateOut) {
      calcRateOut.textContent =
        `${rate}%`;
    }

    calcResult.textContent =
      money(Math.round(payment));
  }

  [
    calcPrice,
    calcDown,
    calcRate
  ].forEach(input => {
    if (input) {
      input.addEventListener(
        'input',
        runCalculator
      );
    }
  });

  termBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      termYears =
        Number(btn.dataset.term) || 30;

      termBtns.forEach(item => {
        const active = item === btn;

        item.classList.toggle(
          'active',
          active
        );

        item.setAttribute(
          'aria-pressed',
          String(active)
        );
      });

      runCalculator();
    });
  });

  runCalculator();

  /* Gallery filters + lightbox */
  const galleryGrid =
    document.getElementById('galleryGrid');

  const galleryCount =
    document.getElementById('galleryCount');

  const filterButtons = [
    ...document.querySelectorAll(
      '.gallery-filter button'
    )
  ];

  let figures = galleryGrid
    ? [...galleryGrid.querySelectorAll('figure')]
    : [];

  function visibleFigures() {
    return figures.filter(
      fig =>
        !fig.classList.contains('hidden')
    );
  }

  function updateGalleryCount() {
    if (!galleryCount) return;

    const total =
      visibleFigures().length;

    galleryCount.textContent =
      `${total} Photo${total === 1 ? '' : 's'}`;
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(item => {
        item.classList.toggle(
          'active',
          item === button
        );
      });

      const filter =
        button.dataset.filter;

      figures.forEach(fig => {
        fig.classList.toggle(
          'hidden',
          filter !== 'all' &&
          fig.dataset.category !== filter
        );
      });

      updateGalleryCount();
    });
  });

  updateGalleryCount();

  const lightbox =
    document.getElementById('lightbox');

  const lightboxImg =
    document.getElementById('lightboxImg');

  const lightboxCap =
    document.getElementById('lightboxCap');

  const lightboxCount =
    document.getElementById('lightboxCount');

  const lightboxClose =
    document.getElementById('lightboxClose');

  const lightboxPrev =
    document.getElementById('lightboxPrev');

  const lightboxNext =
    document.getElementById('lightboxNext');

  let lightboxIndex = 0;

  function openLightbox(index) {
    const visible =
      visibleFigures();

    if (
      !lightbox ||
      !lightboxImg ||
      !visible.length
    ) {
      return;
    }

    lightboxIndex =
      (index + visible.length) %
      visible.length;

    const figure =
      visible[lightboxIndex];

    const img =
      figure.querySelector('img');

    lightboxImg.src =
      img.currentSrc || img.src;

    lightboxImg.alt =
      img.alt || '';

    if (lightboxCap) {
      lightboxCap.textContent =
        figure.dataset.cap || '';
    }

    if (lightboxCount) {
      lightboxCount.textContent =
        `${lightboxIndex + 1} / ${visible.length}`;
    }

    lightbox.classList.add('open');

    lightbox.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'menu-lock'
    );
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove('open');

    lightbox.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'menu-lock'
    );
  }

  figures.forEach(fig => {
    const activate = () =>
      openLightbox(
        visibleFigures().indexOf(fig)
      );

    fig.addEventListener(
      'click',
      activate
    );

    fig.addEventListener(
      'keydown',
      event => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          activate();
        }
      }
    );
  });

  if (lightboxClose) {
    lightboxClose.addEventListener(
      'click',
      closeLightbox
    );
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener(
      'click',
      () =>
        openLightbox(
          lightboxIndex - 1
        )
    );
  }

  if (lightboxNext) {
    lightboxNext.addEventListener(
      'click',
      () =>
        openLightbox(
          lightboxIndex + 1
        )
    );
  }

  if (lightbox) {
    lightbox.addEventListener(
      'click',
      event => {
        if (
          event.target === lightbox
        ) {
          closeLightbox();
        }
      }
    );
  }

  document.addEventListener(
    'keydown',
    event => {
      if (
        !lightbox ||
        !lightbox.classList.contains('open')
      ) {
        return;
      }

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        openLightbox(
          lightboxIndex - 1
        );
      }

      if (event.key === 'ArrowRight') {
        openLightbox(
          lightboxIndex + 1
        );
      }
    }
  );

  /* Testimonials */
  const slides = [
    ...document.querySelectorAll(
      '.testi-slide'
    )
  ];

  const dots = [
    ...document.querySelectorAll(
      '.testi-dot'
    )
  ];

  let slideIndex = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) return;

    slideIndex =
      (index + slides.length) %
      slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle(
        'active',
        i === slideIndex
      );
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle(
        'active',
        i === slideIndex
      );
    });
  }

  function restartTestimonials() {
    if (
      reducedMotion ||
      slides.length < 2
    ) {
      return;
    }

    clearInterval(slideTimer);

    slideTimer = setInterval(
      () =>
        showSlide(
          slideIndex + 1
        ),
      6500
    );
  }

  dots.forEach(dot => {
    dot.addEventListener(
      'click',
      () => {
        showSlide(
          Number(dot.dataset.i) || 0
        );

        restartTestimonials();
      }
    );
  });

  showSlide(0);
  restartTestimonials();

  /* Contact form — no fake submission. */
  const form =
    document.getElementById(
      'contactForm'
    );

  const formMsg =
    document.getElementById(
      'formMsg'
    );

  if (form) {
    form.addEventListener(
      'submit',
      event => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();

          if (formMsg) {
            formMsg.textContent =
              'Please complete your name, email, and message.';
          }

          return;
        }

        if (formMsg) {
          formMsg.textContent =
            'Thanks — your message is ready to send. Please call Marci directly at (206) 919-6886 for the fastest response.';
        }

        form.reset();
      }
    );
  }

  /* Back to top + scroll progress */
  const toTop =
    document.getElementById(
      'toTop'
    );

  const progress =
    document.createElement(
      'div'
    );

  progress.className =
    'page-progress';

  document.body.appendChild(
    progress
  );

  const updateScrollUI = () => {
    const scrollable =
      document.documentElement.scrollHeight -
      window.innerHeight;

    progress.style.width =
      `${
        scrollable > 0
          ? (
              window.scrollY /
              scrollable
            ) * 100
          : 0
      }%`;

    if (toTop) {
      toTop.classList.toggle(
        'show',
        window.scrollY > 650
      );
    }
  };

  updateScrollUI();

  window.addEventListener(
    'scroll',
    updateScrollUI,
    { passive: true }
  );

  if (toTop) {
    toTop.addEventListener(
      'click',
      () => {
        window.scrollTo({
          top: 0,
          behavior:
            reducedMotion
              ? 'auto'
              : 'smooth'
        });
      }
    );
  }

  /* Gentle desktop hero parallax */
  const hero =
    document.querySelector(
      '.hero'
    );

  const heroPhoto =
    document.querySelector(
      '.hero-photo'
    );

  if (
    hero &&
    heroPhoto &&
    !reducedMotion &&
    window.matchMedia(
      '(hover:hover)'
    ).matches
  ) {
    let raf = 0;

    hero.addEventListener(
      'mousemove',
      event => {
        if (raf) {
          cancelAnimationFrame(
            raf
          );
        }

        raf = requestAnimationFrame(
          () => {
            const rect =
              hero.getBoundingClientRect();

            const x =
              (
                (
                  event.clientX -
                  rect.left
                ) /
                rect.width -
                0.5
              ) * -7;

            const y =
              (
                (
                  event.clientY -
                  rect.top
                ) /
                rect.height -
                0.5
              ) * -5;

            heroPhoto.style.transform =
              `scale(1.055) translate3d(${x}px,${y}px,0)`;
          }
        );
      }
    );

    hero.addEventListener(
      'mouseleave',
      () => {
        heroPhoto.style.transform =
          'scale(1.04)';
      }
    );
  }

})();