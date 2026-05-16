/* =================================================================
   motion.js — Arco-style scroll choreography (enhancement layer)
   Runs AFTER scripts.js. Adds: line-mask heading reveals, word
   stagger, magnetic buttons, nav active-section sync, work-card
   cursor glow tracking, momentum-smoothed scroll feel.

   It deliberately does NOT touch the canvas / carousel / typing /
   tilt modules in scripts.js — it only enriches presentation.
   ================================================================= */
(() => {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH   = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ───────────────────────────────────────────────────────────────
     1 · LINE-MASK HEADING REVEALS
     Wrap big display headings so each line slides up from behind a
     mask (the Arco signature). Skips the hero name (typed effect
     already owns it) and anything already wrapped.
     ─────────────────────────────────────────────────────────────── */
  const headingSel = [
    '.section-title',
    '.contact-heading',
    '.pub-title'
  ].join(',');

  function splitIntoLines(el) {
    if (el.dataset.rvDone) return;
    el.dataset.rvDone = '1';

    // Preserve inner HTML structure by splitting on <br> and spaces.
    // We rebuild as: .rv-line > .rv-inner, one per visual line.
    const html = el.innerHTML;
    const chunks = html.split(/<br\s*\/?>/i);

    el.innerHTML = '';
    chunks.forEach((chunk) => {
      const line = document.createElement('span');
      line.className = 'rv-line';
      const inner = document.createElement('span');
      inner.className = 'rv-inner';
      inner.innerHTML = chunk.trim();
      line.appendChild(inner);
      el.appendChild(line);
    });
  }

  if (!REDUCED) {
    document.querySelectorAll(headingSel).forEach(splitIntoLines);
  }

  /* ───────────────────────────────────────────────────────────────
     2 · WORD STAGGER for ledes / sub text
     ─────────────────────────────────────────────────────────────── */
  function splitWords(el) {
    if (el.dataset.rvDone) return;
    el.dataset.rvDone = '1';
    const words = el.textContent.split(/\s+/).filter(Boolean);
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'rv-word';
      span.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
      span.style.transitionDelay = (i * 0.028) + 's';
      el.appendChild(span);
    });
  }
  if (!REDUCED) {
    document.querySelectorAll('.section-lede, .contact-sub')
      .forEach(splitWords);
  }

  /* ───────────────────────────────────────────────────────────────
     3 · STAGGERED REVEAL OBSERVER
     scripts.js handles [data-reveal]/.tl-row already. We add a
     parallel observer that:
       • toggles .is-visible on the split headings + ledes
       • staggers children inside grids (.is-visible cascade)
     We mark our own targets with [data-rv] so we never double-fire
     with the existing observer.
     ─────────────────────────────────────────────────────────────── */
  const rvTargets = [];
  document.querySelectorAll(headingSel + ', .section-lede, .contact-sub')
    .forEach((el) => { el.setAttribute('data-rv', ''); rvTargets.push(el); });

  // Grid stagger groups: each direct child gets an incremental delay
  const staggerGroups = document.querySelectorAll(
    '.work-grid, .stats-grid, .chips, .lang-row, .pub-metrics'
  );

  if (REDUCED || !('IntersectionObserver' in window)) {
    rvTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -12% 0px' });
    rvTargets.forEach((el) => {
      io.observe(el);
      // Safety net: if anything is already in/above the viewport on
      // load (or the observer never fires for it), force-reveal so
      // masked text can never get permanently stuck at opacity:0.
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) el.classList.add('is-visible');
    });
    // Final guarantee — after 2.5s anything still hidden is shown.
    setTimeout(() => {
      rvTargets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && !el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
        }
      });
    }, 2500);

    // Stagger the entrance of grid children by nudging their
    // transition-delay just before they reveal.
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const kids = e.target.children;
        for (let i = 0; i < kids.length; i++) {
          const k = kids[i];
          if (k.hasAttribute('data-reveal')) {
            k.style.transitionDelay = (i * 0.07) + 's';
          }
        }
        sio.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    staggerGroups.forEach((g) => sio.observe(g));
  }

  /* ───────────────────────────────────────────────────────────────
     4 · MAGNETIC BUTTONS + interactive pull
     Pointer subtly attracts buttons / icon buttons (desktop only).
     ─────────────────────────────────────────────────────────────── */
  if (!TOUCH && !REDUCED) {
    const magnets = document.querySelectorAll(
      '.btn, .icon-btn, .scene-dot, .nav-logo'
    );
    magnets.forEach((el) => {
      const STR = el.classList.contains('btn') ? 0.32 : 0.22;
      let raf = false, mx = 0, my = 0;
      function apply() {
        const r = el.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        el.style.transform =
          `translate(${(dx * STR).toFixed(2)}px, ${(dy * STR).toFixed(2)}px)`;
        raf = false;
      }
      el.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!raf) { requestAnimationFrame(apply); raf = true; }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .55s var(--ease-spring)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 560);
      });
    });
  }

  /* ───────────────────────────────────────────────────────────────
     5 · WORK-CARD CURSOR GLOW
     Feeds --mx/--my so the radial sheen in styles.css tracks the
     pointer across each card.
     ─────────────────────────────────────────────────────────────── */
  if (!TOUCH) {
    document.querySelectorAll('.work-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ───────────────────────────────────────────────────────────────
     6 · NAV ACTIVE-SECTION SYNC
     Highlights the current section link as you scroll (Arco-style
     pill that follows you down the page).
     ─────────────────────────────────────────────────────────────── */
  (() => {
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    if (!links.length) return;
    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const sec = document.querySelector(id);
        if (sec) map.set(sec, a);
      }
    });
    if (!('IntersectionObserver' in window) || !map.size) return;
    const nio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-current'));
        const a = map.get(e.target);
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, sec) => nio.observe(sec));
  })();

  /* ───────────────────────────────────────────────────────────────
     7 · DEPTH PARALLAX ON SCROLL
     Section numbers + alt-section auras drift for living depth.
     Cheap: transform only, rAF-throttled, desktop only.
     ─────────────────────────────────────────────────────────────── */
  if (!REDUCED && !TOUCH) {
    const layers = [];
    document.querySelectorAll('.section-num').forEach((el) =>
      layers.push({ el, k: 0.05 }));
    document.querySelectorAll('.hero-watermark').forEach((el) =>
      layers.push({ el, k: 0.12, z: -220 }));

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        layers.forEach(({ el, k, z }) => {
          const r = el.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          const off = (mid - vh / 2) * -k;
          el.style.transform = z != null
            ? `translateZ(${z}px) translateY(${off.toFixed(1)}px)`
            : `translateZ(36px) translateY(${off.toFixed(1)}px)`;
        });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ───────────────────────────────────────────────────────────────
     8 · MARQUEE — ensure it is populated (defensive; styles.css
     drives the actual animation via CSS keyframes).
     ─────────────────────────────────────────────────────────────── */
  (() => {
    const track = document.getElementById('marquee-track');
    if (track && !track.children.length) {
      const kw = ['Deep Learning','Bioinformatics','NGS Analysis','Precision Medicine',
        'Cancer Genomics','Machine Learning','Survival Analysis','Single-cell RNA-seq',
        'Variant Calling','Computational Biology','TensorFlow','Python','Genomics',
        'Biostatistics','Random Survival Forest','TCGA','METABRIC','ECM Proteases'];
      const set = () => kw.map((k) =>
        `<span class="marquee-item"><span class="marquee-diamond" aria-hidden="true"></span>${k}</span>`
      ).join('');
      track.innerHTML = set() + set();
    }
  })();

  /* ───────────────────────────────────────────────────────────────
     9 · REVEAL SAFETY NET (global)
     scripts.js owns the primary [data-reveal]/.tl-row observer with
     progressive reveal on scroll. This net catches edge cases where
     a programmatic jump (anchor link, restored scroll position, very
     fast wheel) lands content fully in view WITHOUT generating the
     intersection events the primary observer needs — so nothing can
     ever stay stuck at opacity:0 once it's clearly on screen.
     It never *prevents* the nice progressive reveal: it only acts on
     elements already comfortably inside the viewport.
     ─────────────────────────────────────────────────────────────── */
  if (!REDUCED) {
    let netTick = false;
    function revealNet() {
      if (netTick) return;
      netTick = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        document.querySelectorAll('[data-reveal]:not(.is-visible), .tl-row:not(.is-visible), [data-rv]:not(.is-visible)')
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            // Reveal anything at/above the fold OR already scrolled
            // past (top above viewport). Below-fold items are left
            // alone so they still animate in progressively on scroll.
            const enteredView = r.top < vh * 0.88 && r.bottom > 0;
            const scrolledPast = r.bottom <= 0;
            if (enteredView || scrolledPast) {
              el.classList.add('is-visible');
              el.querySelectorAll('[data-target]').forEach((c) => {
                if (c.dataset.done) return;
                c.dataset.done = '1';
                const end = parseFloat(c.dataset.target);
                const dec = parseInt(c.dataset.dec || '0', 10);
                const suf = c.dataset.suffix || '';
                const t0 = performance.now();
                (function step(now) {
                  const t = Math.min((now - t0) / 1500, 1);
                  const e = 1 - Math.pow(1 - t, 3);
                  c.textContent = (e * end).toFixed(dec) + suf;
                  if (t < 1) requestAnimationFrame(step);
                  else c.textContent = end.toFixed(dec) + suf;
                })(t0);
              });
            }
          });
        netTick = false;
      });
    }
    window.addEventListener('scroll', revealNet, { passive: true });
    window.addEventListener('resize', revealNet, { passive: true });
    window.addEventListener('hashchange', () => setTimeout(revealNet, 60));
    // run a few times after load to absorb late layout / font shifts
    revealNet();
    setTimeout(revealNet, 400);
    setTimeout(revealNet, 1200);
    setTimeout(revealNet, 2600);
  }

})();
