/* =================================================================
   Rami Babas — Portfolio Scripts
   Vanilla JS · IIFE-organized · IntersectionObserver-driven
   ================================================================= */
(() => {
  'use strict';

  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ─────────────────────────────────────────────────────────────
     SCENE METADATA — drives hero canvas + accent colour
     ───────────────────────────────────────────────────────────── */
  const SCENES = [
    {
      phrase:  'Building machine-learning pipelines for cancer prognosis.',
      eyebrow: 'Computational Biology · Machine Learning',
      hud:     'NEURAL',
      cssVar:  'oklch(62% 0.14 42)',
      rgb:     [192, 112, 74],
    },
    {
      phrase:  'Developing NGS workflows for genomic and transcriptomic analysis.',
      eyebrow: 'Genomics · NGS',
      hud:     'HELIX',
      cssVar:  'oklch(58% 0.10 155)',
      rgb:     [90, 138, 106],
    },
    {
      phrase:  'Bridging deep learning with the life sciences.',
      eyebrow: 'Biotechnology · AI',
      hud:     'CELL',
      cssVar:  'oklch(48% 0.08 230)',
      rgb:     [74, 106, 138],
    },
    {
      phrase:  'Engineering precision diagnostic systems.',
      eyebrow: 'Systems · Engineering',
      hud:     'CIRCUIT',
      cssVar:  'oklch(74% 0.16 72)',
      rgb:     [192, 144, 64],
    },
  ];

  let activeScene = 0;

  function applyScene(i) {
    activeScene = i;
    const s = SCENES[i];

    document.documentElement.style.setProperty('--scene-color', s.cssVar);

    const eyebrow = document.getElementById('eyebrow-label');
    if (eyebrow) {
      eyebrow.style.opacity = '0';
      setTimeout(() => {
        eyebrow.textContent = s.eyebrow;
        eyebrow.style.opacity = '1';
      }, 120);
    }

    const hudName = document.getElementById('hud-name');
    if (hudName) hudName.textContent = s.hud;
    const hudId = document.getElementById('hud-id');
    if (hudId) hudId.textContent = `SCN_0${i + 1} / 04`;

    document.querySelectorAll('.scene-dot').forEach((d, idx) => {
      const on = idx === i;
      d.classList.toggle('is-active', on);
      d.setAttribute('aria-selected', String(on));
    });
  }

  /* ─────────────────────────────────────────────────────────────
     THEME (dark / light) with localStorage persistence
     ───────────────────────────────────────────────────────────── */
  (() => {
    const KEY = 'rb-theme';
    const root = document.body;
    const btn  = document.getElementById('theme-toggle');

    const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.dataset.theme = initial;
    btn.setAttribute('aria-pressed', String(initial === 'dark'));

    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      btn.setAttribute('aria-pressed', String(next === 'dark'));
      try { localStorage.setItem(KEY, next); } catch {}
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     CUSTOM CURSOR
     ───────────────────────────────────────────────────────────── */
  if (!IS_TOUCH && !PREFERS_REDUCED) {
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    function tick() {
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    tick();

    const interactive = 'a, button, .stat, .chip, .scene-dot, .work-card, .edu-card, .lang, .contact-link, .nav-logo';
    document.querySelectorAll(interactive).forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
    });
  }

  /* ─────────────────────────────────────────────────────────────
     SCROLL PROGRESS + NAV STATE + BACK-TO-TOP
     ───────────────────────────────────────────────────────────── */
  (() => {
    const progress = document.getElementById('progress');
    const nav = document.getElementById('nav');
    const btt = document.getElementById('back-to-top');
    let raf = false;

    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = pct + '%';
      nav.classList.toggle('scrolled', window.scrollY > 60);
      btt.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
      raf = false;
    }

    window.addEventListener('scroll', () => {
      if (!raf) {
        requestAnimationFrame(update);
        raf = true;
      }
    }, { passive: true });

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: PREFERS_REDUCED ? 'auto' : 'smooth' });
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     REVEAL ON SCROLL
     ───────────────────────────────────────────────────────────── */
  (() => {
    const els = document.querySelectorAll('[data-reveal], .tl-row');
    if (!('IntersectionObserver' in window) || PREFERS_REDUCED) {
      els.forEach((el) => el.classList.add('is-visible'));
      // also run counters immediately
      document.querySelectorAll('[data-target]').forEach(runCounter);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        e.target.querySelectorAll('[data-target]').forEach(runCounter);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el, i) => {
      // stagger timeline rows slightly
      if (el.classList.contains('tl-row')) {
        el.style.transitionDelay = (i * 0.04) + 's';
      }
      io.observe(el);
    });
  })();

  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (PREFERS_REDUCED) { el.textContent = end.toFixed(dec) + suffix; return; }
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / 1600, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (ease * end).toFixed(dec) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = end.toFixed(dec) + suffix;
    })(performance.now());
  }

  /* ─────────────────────────────────────────────────────────────
     MARQUEE
     ───────────────────────────────────────────────────────────── */
  (() => {
    const track = document.getElementById('marquee-track');
    if (!track) return;
    const keywords = [
      'Deep Learning', 'Bioinformatics', 'NGS Analysis', 'Precision Medicine',
      'Cancer Genomics', 'Machine Learning', 'Survival Analysis', 'Single-cell RNA-seq',
      'Variant Calling', 'Computational Biology', 'TensorFlow', 'Python',
      'scRNA-seq', 'Data Science', 'Genomics', 'Biostatistics',
      'Process Control', 'gPROMS', 'Convolutional Neural Networks',
      'Random Survival Forest', 'TCGA', 'METABRIC', 'ECM Proteases',
      'Digital Twin', 'Pharmaceutical Engineering', 'Biotechnology',
      'Clinical Chemistry', 'Food Quality Analytics', 'Open Access Research'
    ];
    const buildItems = () => keywords.map(k =>
      `<span class="marquee-item"><span class="marquee-diamond" aria-hidden="true"></span>${k}</span>`
    ).join('');
    // Duplicate for seamless loop
    track.innerHTML = buildItems() + buildItems();

    let x = 0;
    const speed = 0.6;
    let rafId;
    let isPaused = false;

    function animate() {
      if (!isPaused) {
        x -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(x) >= halfWidth) x = 0;
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    }

    track.addEventListener('mouseenter', () => { isPaused = true; });
    track.addEventListener('mouseleave', () => { isPaused = false; });
    animate();
    window.addEventListener('pagehide', () => cancelAnimationFrame(rafId));
  })();

  /* ─────────────────────────────────────────────────────────────
     TYPING EFFECT in hero
     Scene swap fires at the START of deletion so the canvas fades
     out together with the disappearing text. By the time the new
     phrase begins typing, the new scene is already in place.
     ───────────────────────────────────────────────────────────── */
  (() => {
    const target = document.getElementById('type-target');
    if (!target) return;

    if (PREFERS_REDUCED) {
      target.textContent = SCENES[0].phrase;
      return;
    }

    // Cheap mobile detection — slightly slower typing on touch
    // because tiny viewports + reading speed don't match desktop.
    const SLOWER = IS_TOUCH;

    const TYPE_MS    = SLOWER ? 24 : 18;   // per char
    const TYPE_JIT   = SLOWER ? 14 : 12;
    const HOLD_MS    = SLOWER ? 1400 : 1100; // pause after full phrase
    const DELETE_MS  = SLOWER ? 11 : 8;     // per char
    const SWITCH_MS  = 180;                  // gap before next phrase types

    let pi = 0, ci = 0, deleting = false, swapped = false;

    function loop() {
      const phrase = SCENES[pi].phrase;
      target.innerHTML = phrase.slice(0, ci) + '<span class="type-cursor"></span>';

      if (!deleting) {
        ci++;
        if (ci > phrase.length) {
          deleting = true;
          swapped = false;
          setTimeout(loop, HOLD_MS);
          return;
        }
        setTimeout(loop, TYPE_MS + Math.random() * TYPE_JIT);
      } else {
        // At the very first deletion frame, swap the scene. The canvas
        // crossfade and the deleting text now run together.
        if (!swapped) {
          swapped = true;
          const next = (pi + 1) % SCENES.length;
          applyScene(next);
          if (canvasAPI) canvasAPI.switchScene(next);
        }
        ci--;
        if (ci < 0) {
          deleting = false;
          pi = (pi + 1) % SCENES.length;
          setTimeout(loop, SWITCH_MS);
          return;
        }
        setTimeout(loop, DELETE_MS);
      }
    }
    setTimeout(loop, 900);
  })();

  /* ─────────────────────────────────────────────────────────────
     SCENE INDICATOR CLICK HANDLERS
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll('.scene-dot').forEach((d) => {
    d.addEventListener('click', () => {
      const i = parseInt(d.dataset.scene, 10);
      applyScene(i);
      if (canvasAPI) canvasAPI.switchScene(i);
    });
  });

  /* ─────────────────────────────────────────────────────────────
     HERO CANVAS — 4 scenes (neural / DNA / cell / circuit)
     Optimized: pauses when offscreen, fewer particles on mobile,
     and resizes correctly on iOS rotation / address-bar collapse.
     ───────────────────────────────────────────────────────────── */
  let canvasAPI = null;

  (() => {
    const canvas = document.getElementById('mol-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function sizeCanvas() {
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 460;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    // iOS rotation fires orientationchange, not always resize
    window.addEventListener('orientationchange', () => {
      // delay because clientWidth doesn't update synchronously on iOS
      setTimeout(sizeCanvas, 200);
    });

    const W = () => canvas.clientWidth || 460;
    const H = () => canvas.clientHeight || 460;
    const CX = () => W() / 2;
    const CY = () => H() / 2;

    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const TERRA = [192, 112, 74],
          AMBER = [192, 144, 64],
          SAGE  = [90, 138, 106],
          SLATE = [74, 106, 138],
          INK   = [15, 13, 10],
          INK2  = [42, 36, 28],
          INK3  = [107, 94, 77];

    const N = IS_TOUCH ? 56 : 80;
    const particles = Array.from({ length: N }, () => ({
      x: 0, y: 0, tx: 0, ty: 0,
      lerp: 0.05 + Math.random() * 0.05,
      role: '', data: {},
      size: 3, color: INK2,
      phase: Math.random() * Math.PI * 2,
      pulse: 0.5 + Math.random() * 0.5,
    }));

    let currentScene = 0;
    let frame = 0;
    const overlayA = [1, 0, 0, 0];
    let parX = 0, parY = 0, pmx = CX(), pmy = CY();
    let inView = true;
    let running = true;

    /* ── SCENE 0: NEURAL NETWORK ────────────────────────────── */
    const NN_LAYERS = [4, 6, 6, 3];

    function NN_X(li) {
      return 70 + li * (W() - 140) / (NN_LAYERS.length - 1);
    }
    function nnY(li, ni) {
      return CY() - (NN_LAYERS[li] - 1) * 26 + ni * 52;
    }
    function assignNNPkt(d) {
      d.li = Math.floor(Math.random() * (NN_LAYERS.length - 1));
      d.fromN = Math.floor(Math.random() * NN_LAYERS[d.li]);
      d.toN = Math.floor(Math.random() * NN_LAYERS[d.li + 1]);
    }
    function setNeural() {
      let p = 0;
      NN_LAYERS.forEach((cnt, li) => {
        for (let ni = 0; ni < cnt; ni++) {
          const pt = particles[p++];
          pt.tx = NN_X(li); pt.ty = nnY(li, ni);
          pt.role = 'nn-node'; pt.data = { li, ni };
          pt.size = (li === 0 || li === NN_LAYERS.length - 1) ? 6 : 5;
          pt.color = li === NN_LAYERS.length - 1 ? TERRA : (li === 0 ? INK2 : SLATE);
        }
      });
      while (p < N) {
        const pt = particles[p++];
        pt.role = 'nn-pkt';
        pt.data = { t: Math.random(), speed: 0.004 + Math.random() * 0.006 };
        assignNNPkt(pt.data);
        pt.size = 1.8;
        pt.color = TERRA;
      }
    }
    function updateNeural() {
      particles.forEach((p) => {
        if (p.role !== 'nn-pkt') return;
        p.data.t += p.data.speed;
        if (p.data.t > 1) { p.data.t = 0; assignNNPkt(p.data); }
        const x1 = NN_X(p.data.li), x2 = NN_X(p.data.li + 1);
        const y1 = nnY(p.data.li, p.data.fromN);
        const y2 = nnY(p.data.li + 1, p.data.toN);
        p.tx = x1 + (x2 - x1) * p.data.t;
        p.ty = y1 + (y2 - y1) * p.data.t;
      });
    }
    function drawNN(a) {
      ctx.save(); ctx.globalAlpha = a;
      for (let li = 0; li < NN_LAYERS.length - 1; li++) {
        for (let i = 0; i < NN_LAYERS[li]; i++) {
          for (let j = 0; j < NN_LAYERS[li + 1]; j++) {
            const w = 0.06 + ((li * 97 + i * 31 + j * 17) % 100) / 100 * 0.16;
            ctx.beginPath();
            ctx.moveTo(NN_X(li), nnY(li, i));
            ctx.lineTo(NN_X(li + 1), nnY(li + 1, j));
            ctx.strokeStyle = rgba(INK2, w);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      const labels = ['INPUT', 'HIDDEN', 'HIDDEN', 'OUTPUT'];
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = rgba(INK3, 0.55);
      ctx.textAlign = 'center';
      NN_LAYERS.forEach((cnt, li) => {
        ctx.fillText(labels[li], NN_X(li), nnY(li, cnt - 1) + 50);
      });
      ctx.restore();
    }

    /* ── SCENE 1: DNA HELIX ────────────────────────────────── */
    const DNA_PAIRS = 18, DNA_TURNS = 2.4, DNA_R = 88;
    const BASES = ['A', 'T', 'G', 'C'];
    const PAIR_BASES = Array.from({ length: DNA_PAIRS }, () => {
      const a = Math.floor(Math.random() * 4);
      return [BASES[a], BASES[a < 2 ? 1 - a : 5 - a]];
    });
    let helixRot = 0;

    function setDNA() {
      let p = 0;
      const top = CY() - 180;
      for (let i = 0; i < DNA_PAIRS; i++) {
        const t = i / (DNA_PAIRS - 1);
        const ba = t * DNA_TURNS * Math.PI * 2;
        for (let s = 0; s < 2; s++) {
          const pt = particles[p++];
          pt.role = 'dna';
          pt.data = { i, strand: s, ba, depth: 0 };
          pt.tx = CX() + Math.cos(ba + (s ? Math.PI : 0)) * DNA_R;
          pt.ty = top + t * 360;
          pt.size = 5;
          pt.color = s ? TERRA : SAGE;
        }
      }
      while (p < N) {
        const pt = particles[p++];
        pt.role = 'dna-amb';
        pt.data = {
          phase: Math.random() * Math.PI * 2,
          speed: 0.003 + Math.random() * 0.005,
          side: Math.random() < 0.5 ? -1 : 1,
          offset: 30 + Math.random() * 80,
        };
        pt.size = 1.6;
        pt.color = INK3;
      }
    }
    function updateDNA() {
      helixRot += 0.011;
      const top = CY() - 180;
      particles.forEach((p) => {
        if (p.role === 'dna') {
          const t = p.data.i / (DNA_PAIRS - 1);
          const ang = p.data.ba + helixRot + (p.data.strand ? Math.PI : 0);
          p.data.depth = (Math.sin(ang) + 1) / 2;
          p.tx = CX() + Math.cos(ang) * DNA_R;
          p.ty = top + t * 360;
          p.size = 3.5 + p.data.depth * 2.5;
        } else if (p.role === 'dna-amb') {
          p.data.phase += p.data.speed;
          const t = (((p.data.phase / (Math.PI * 2)) % 1) + 1) % 1;
          p.tx = CX() + p.data.side * (DNA_R + p.data.offset) + Math.sin(p.data.phase * 1.4) * 8;
          p.ty = top + t * 360;
        }
      });
    }
    function drawDNA(a) {
      ctx.save(); ctx.globalAlpha = a;
      const pairs = {};
      particles.forEach((p) => {
        if (p.role !== 'dna') return;
        if (!pairs[p.data.i]) pairs[p.data.i] = [null, null];
        pairs[p.data.i][p.data.strand] = p;
      });
      // strand lines
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        let first = true;
        for (let i = 0; i < DNA_PAIRS; i++) {
          if (!pairs[i] || !pairs[i][s]) continue;
          const p = pairs[i][s];
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = rgba(s ? TERRA : SAGE, 0.55);
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      // base pairs
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < DNA_PAIRS; i++) {
        const pp = pairs[i];
        if (!pp || !pp[0] || !pp[1]) continue;
        const dx = Math.abs(pp[0].x - pp[1].x);
        ctx.beginPath();
        ctx.moveTo(pp[0].x, pp[0].y);
        ctx.lineTo(pp[1].x, pp[1].y);
        ctx.strokeStyle = rgba(INK2, 0.12 + (dx / (DNA_R * 2)) * 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
        const bs = PAIR_BASES[i];
        for (let s = 0; s < 2; s++) {
          const pn = pp[s];
          ctx.fillStyle = rgba(s ? TERRA : SAGE, 0.62);
          ctx.textAlign = pn.x > CX() ? 'left' : 'right';
          ctx.fillText(bs[s], pn.x + (pn.x > CX() ? 8 : -8), pn.y);
        }
      }
      ctx.restore();
    }

    /* ── SCENE 2: CELL ─────────────────────────────────────── */
    const CELL_OUT = 38, CELL_SYN = 28;

    function buildSynPos() {
      return Array.from({ length: CELL_SYN }, (_, i) => {
        const ang = (i / CELL_SYN) * Math.PI * 2 + (i % 3) * 0.7;
        const r = 28 + (i % 4) * 22 + Math.sin(i * 1.7) * 8;
        return { x: CX() + Math.cos(ang) * r, y: CY() + Math.sin(ang) * r * 0.92 };
      });
    }
    function buildSynLinks(synPos) {
      const links = [];
      synPos.forEach((_, i) => {
        const dists = synPos
          .map((m, j) => j === i ? null : [j, Math.hypot(synPos[i].x - m.x, synPos[i].y - m.y)])
          .filter(Boolean);
        dists.sort((a, b) => a[1] - b[1]);
        dists.slice(0, 2).forEach(([j]) => { if (i < j) links.push([i, j]); });
      });
      return links;
    }
    let synPos = [], synLinks = [];

    function cellOutline(t) {
      const ang = t * Math.PI * 2;
      const r = 142 + Math.sin(ang * 3 + 0.5) * 5 + Math.sin(ang * 7) * 2.5;
      return { x: CX() + Math.cos(ang) * r, y: CY() + Math.sin(ang) * r * 0.95 };
    }
    function setCell() {
      synPos = buildSynPos();
      synLinks = buildSynLinks(synPos);
      let p = 0;
      for (let i = 0; i < CELL_OUT; i++) {
        const pt = cellOutline(i / CELL_OUT);
        const par = particles[p++];
        par.role = 'cell-out';
        par.data = { t: i / CELL_OUT };
        par.tx = pt.x; par.ty = pt.y;
        par.size = 2.6;
        par.color = TERRA;
      }
      for (let i = 0; i < CELL_SYN; i++) {
        const par = particles[p++];
        par.role = 'cell-syn';
        par.data = { i };
        par.tx = synPos[i].x; par.ty = synPos[i].y;
        par.size = 3.6;
        par.color = SAGE;
      }
      while (p < N) {
        const par = particles[p++];
        const ang = Math.random() * Math.PI * 2;
        const r = 145 + Math.random() * 20;
        par.role = 'cell-amb';
        par.data = { ang, baseR: r, phase: Math.random() * Math.PI * 2 };
        par.tx = CX() + Math.cos(ang) * r;
        par.ty = CY() + Math.sin(ang) * r * 0.95;
        par.size = 1.4;
        par.color = INK3;
      }
    }
    function updateCell() {
      particles.forEach((p) => {
        if (p.role !== 'cell-amb') return;
        p.data.phase += 0.01;
        const r = p.data.baseR + Math.sin(p.data.phase) * 6;
        p.tx = CX() + Math.cos(p.data.ang) * r;
        p.ty = CY() + Math.sin(p.data.ang) * r * 0.95;
      });
    }
    function drawCell(a) {
      ctx.save(); ctx.globalAlpha = a;
      const out = particles.filter((p) => p.role === 'cell-out').sort((a, b) => a.data.t - b.data.t);
      if (out.length > 2) {
        ctx.beginPath();
        out.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = rgba(TERRA, 0.04);
        ctx.fill();
        ctx.strokeStyle = rgba(TERRA, 0.5);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
      const syn = particles.filter((p) => p.role === 'cell-syn').sort((a, b) => a.data.i - b.data.i);
      synLinks.forEach(([i, j]) => {
        if (!syn[i] || !syn[j]) return;
        const A = syn[i], B = syn[j];
        const pulse = (Math.sin(frame * 0.03 + i * 0.7) + 1) / 2;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = rgba(SAGE, 0.18 + pulse * 0.22);
        ctx.lineWidth = 1;
        ctx.stroke();
        const sp = (frame * 0.012 + i * 0.41) % 1;
        const sx = A.x + (B.x - A.x) * sp;
        const sy = A.y + (B.y - A.y) * sp;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(SLATE, 0.85);
        ctx.fill();
      });
      ctx.restore();
    }

    /* ── SCENE 3: CIRCUIT ──────────────────────────────────── */
    const G = 5, CELLW = 64;

    function gxy(gx, gy) {
      return {
        x: CX() - (G - 1) * CELLW / 2 + gx * CELLW,
        y: CY() - (G - 1) * CELLW / 2 + gy * CELLW,
      };
    }
    const traces = [];
    for (let gy = 0; gy < G; gy++) {
      for (let gx = 0; gx < G; gx++) {
        const s = (gx * 31 + gy * 17) % 100;
        if (gx < G - 1 && s < 75) traces.push({ a: [gx, gy], b: [gx + 1, gy] });
        if (gy < G - 1 && ((gx * 17 + gy * 41) % 100) < 70) traces.push({ a: [gx, gy], b: [gx, gy + 1] });
      }
    }
    function setCircuit() {
      let p = 0;
      for (let gy = 0; gy < G; gy++) {
        for (let gx = 0; gx < G; gx++) {
          if (p >= N) break;
          const par = particles[p++];
          const pt = gxy(gx, gy);
          par.role = 'cir-chip';
          par.data = { gx, gy };
          par.tx = pt.x; par.ty = pt.y;
          par.size = 4;
          par.color = AMBER;
        }
      }
      while (p < N) {
        const par = particles[p++];
        par.role = 'cir-pkt';
        par.data = {
          tr: traces[Math.floor(Math.random() * traces.length)],
          t: Math.random(),
          speed: 0.005 + Math.random() * 0.008,
        };
        par.size = 1.8;
        par.color = TERRA;
      }
    }
    function updateCircuit() {
      particles.forEach((p) => {
        if (p.role !== 'cir-pkt') return;
        p.data.t += p.data.speed;
        if (p.data.t > 1) {
          p.data.t = 0;
          p.data.tr = traces[Math.floor(Math.random() * traces.length)];
        }
        const a = gxy(p.data.tr.a[0], p.data.tr.a[1]);
        const b = gxy(p.data.tr.b[0], p.data.tr.b[1]);
        p.tx = a.x + (b.x - a.x) * p.data.t;
        p.ty = a.y + (b.y - a.y) * p.data.t;
      });
    }
    function drawCircuit(a) {
      ctx.save(); ctx.globalAlpha = a;
      traces.forEach((tr) => {
        const A = gxy(tr.a[0], tr.a[1]);
        const B = gxy(tr.b[0], tr.b[1]);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = rgba(INK2, 0.22);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      for (let gy = 0; gy < G; gy++) {
        for (let gx = 0; gx < G; gx++) {
          const pt = gxy(gx, gy);
          const pulse = 0.4 + (Math.sin(frame * 0.018 + (gx + gy) * 0.4) + 1) / 4;
          ctx.strokeStyle = rgba(AMBER, pulse * 0.55);
          ctx.lineWidth = 1;
          ctx.strokeRect(pt.x - 8, pt.y - 8, 16, 16);
        }
      }
      ctx.restore();
    }

    const SET_FNS = [setNeural, setDNA, setCell, setCircuit];
    const UPD_FNS = [updateNeural, updateDNA, updateCell, updateCircuit];
    const DRW_FNS = [drawNN, drawDNA, drawCell, drawCircuit];

    function switchScene(i) {
      if (i === currentScene) return;
      currentScene = i;
      SET_FNS[i]();
    }

    // Init
    setNeural();
    particles.forEach((p) => { p.x = p.tx; p.y = p.ty; });

    // Mouse parallax inside canvas
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      pmx = (e.clientX - r.left) * (W() / r.width);
      pmy = (e.clientY - r.top) * (H() / r.height);
    });
    canvas.addEventListener('mouseleave', () => { pmx = CX(); pmy = CY(); });

    // Pause when offscreen
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          inView = e.isIntersecting;
          if (inView && !running) { running = true; render(); }
        });
      }, { threshold: 0 });
      obs.observe(canvas);
    }

    function render() {
      if (!inView) { running = false; return; }
      running = true;
      frame++;
      ctx.clearRect(0, 0, W(), H());

      parX += ((pmx - CX()) * 0.06 - parX) * 0.06;
      parY += ((pmy - CY()) * 0.06 - parY) * 0.06;

      UPD_FNS[currentScene]();

      particles.forEach((p) => {
        p.x += (p.tx - p.x) * p.lerp;
        p.y += (p.ty - p.y) * p.lerp;
      });

      overlayA.forEach((_, i) => {
        const t = i === currentScene ? 1 : 0;
        // Crossfade rate — tuned to complete in ~120ms so scene swap
        // visually completes during the typing-deletion window.
        overlayA[i] += (t - overlayA[i]) * 0.13;
      });

      ctx.save();
      ctx.translate(parX, parY);

      DRW_FNS.forEach((fn, i) => {
        if (overlayA[i] > 0.01) fn(overlayA[i]);
      });

      [...particles].sort((a, b) => a.y - b.y).forEach((p) => {
        const pulse = 1 + Math.sin(frame * 0.045 + p.phase) * 0.13 * p.pulse;
        const r = p.size * pulse;
        ctx.beginPath();
        ctx.arc(p.x + 1.2, p.y + 1.2, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(INK, 0.06);
        ctx.fill();
        const g = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, 0, p.x, p.y, r);
        g.addColorStop(0, rgba(p.color, 1));
        g.addColorStop(1, rgba(p.color, 0.55));
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      ctx.restore();

      requestAnimationFrame(render);
    }

    if (!PREFERS_REDUCED) {
      render();
    } else {
      // single static frame
      render();
      running = false;
    }

    canvasAPI = { switchScene };
  })();

  /* Apply the initial scene (now that canvasAPI exists) */
  applyScene(0);

  /* ─────────────────────────────────────────────────────────────
     SKILLS CONSTELLATION — physics-driven, draggable
     ───────────────────────────────────────────────────────────── */
  (() => {
    const wrap = document.querySelector('.constellation');
    const canvas = document.getElementById('skill-canvas');
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;

    const SKILLS = [
      { label: 'Python',      cat: 0, mass: 1.7 },
      { label: 'TensorFlow',  cat: 0, mass: 1.3 },
      { label: 'PyTorch',     cat: 0, mass: 1.3 },
      { label: 'Keras',       cat: 0, mass: 1.1 },
      { label: 'Scikit-learn',cat: 0, mass: 1.2 },
      { label: 'OpenCV',      cat: 0, mass: 1.0 },
      { label: 'CNN',         cat: 0, mass: 1.4 },
      { label: 'NGS',         cat: 1, mass: 1.5 },
      { label: 'Scanpy',      cat: 1, mass: 1.2 },
      { label: 'FreeBayes',   cat: 1, mass: 1.0 },
      { label: 'BLAST',       cat: 1, mass: 1.1 },
      { label: 'Clustal Ω',   cat: 1, mass: 1.0 },
      { label: 'Galaxy',      cat: 1, mass: 1.0 },
      { label: 'RNA-seq',     cat: 1, mass: 1.3 },
      { label: 'pandas',      cat: 2, mass: 1.2 },
      { label: 'NumPy',       cat: 2, mass: 1.2 },
      { label: 'Matplotlib',  cat: 2, mass: 1.0 },
      { label: 'SciPy',       cat: 2, mass: 1.0 },
      { label: 'SAS',         cat: 2, mass: 1.0 },
      { label: 'SQL',         cat: 2, mass: 1.0 },
      { label: 'Stata',       cat: 2, mass: 0.9 },
      { label: 'PCR',         cat: 3, mass: 1.1 },
      { label: 'Cell Culture',cat: 3, mass: 1.0 },
      { label: 'MATLAB',      cat: 3, mass: 1.1 },
      { label: 'ANSYS',       cat: 3, mass: 1.0 },
      { label: 'gPROMS',      cat: 3, mass: 1.0 },
      { label: 'Microfluidics', cat: 3, mass: 1.1 },
    ];
    const COLORS = ['#c0704a', '#5a8a6a', '#4a6a8a', '#c09040'];

    let nodes = [], dragging = null, dragOffX = 0, dragOffY = 0, hov = -1;
    let frame2 = 0, presettling = true, inView = true, running = false;

    function ah(a) {
      return Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
    }

    function resize() {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    }

    function initNodes() {
      const cX = [0.26, 0.74, 0.26, 0.74];
      const cY = [0.28, 0.28, 0.72, 0.72];
      const counts = [0, 0, 0, 0];
      const mobile = W < 600;

      nodes = SKILLS.map((s) => {
        const idx = counts[s.cat]++;
        const angle = (idx / 7) * Math.PI * 2 + s.cat * 0.8;
        const spread = (mobile ? 60 : 90) + idx * (mobile ? 14 : 20);
        return {
          ...s,
          x: W * cX[s.cat] + Math.cos(angle) * spread * 0.6 + (Math.random() - 0.5) * 30,
          y: H * cY[s.cat] + Math.sin(angle) * spread * 0.6 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: (mobile ? 18 : 24) + s.mass * (mobile ? 6 : 10),
          phase: Math.random() * Math.PI * 2,
          breathPhase: Math.random() * Math.PI * 2,
        };
      });
    }

    resize();
    window.addEventListener('resize', () => {
      presettling = true;
      resize();
      for (let i = 0; i < 300; i++) simStep();
      presettling = false;
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        presettling = true;
        resize();
        for (let i = 0; i < 300; i++) simStep();
        presettling = false;
      }, 200);
    });

    function getMouse(e) {
      const r = canvas.getBoundingClientRect();
      const t = (e.touches && e.touches[0]) || e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    function onMove(e) {
      const { x, y } = getMouse(e);
      if (dragging !== null) {
        nodes[dragging].x = x + dragOffX;
        nodes[dragging].y = y + dragOffY;
        nodes[dragging].vx = nodes[dragging].vy = 0;
        if (e.cancelable) e.preventDefault();
      }
      hov = -1;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (Math.hypot(x - n.x, y - n.y) < n.r) { hov = i; break; }
      }
    }
    function onDown(e) {
      const { x, y } = getMouse(e);
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (Math.hypot(x - n.x, y - n.y) < n.r) {
          dragging = i;
          dragOffX = n.x - x;
          dragOffY = n.y - y;
          if (e.cancelable) e.preventDefault();
          return;
        }
      }
    }
    function onUp() { dragging = null; }

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    function simStep() {
      const cX = [W * 0.26, W * 0.74, W * 0.26, W * 0.74];
      const cY = [H * 0.28, H * 0.28, H * 0.72, H * 0.72];
      nodes.forEach((n, i) => {
        if (dragging === i) return;
        nodes.forEach((m, j) => {
          if (i === j) return;
          const dx = n.x - m.x, dy = n.y - m.y;
          const dist = Math.max(Math.hypot(dx, dy), 0.1);
          const minD = n.r + m.r + 12;
          if (dist < minD) {
            const ov = (minD - dist) / dist;
            n.vx += dx * ov * 0.25;
            n.vy += dy * ov * 0.25;
          } else {
            const f = 3200 / (dist * dist);
            n.vx += (dx / dist) * f * 0.008;
            n.vy += (dy / dist) * f * 0.008;
          }
        });
        n.vx += (W / 2 - n.x) * 0.0006;
        n.vy += (H / 2 - n.y) * 0.0006;
        n.vx += (cX[n.cat] - n.x) * 0.0012;
        n.vy += (cY[n.cat] - n.y) * 0.0012;
        if (!presettling && !PREFERS_REDUCED) {
          n.vx += Math.sin(frame2 * 0.013 + n.phase) * 0.055;
          n.vy += Math.cos(frame2 * 0.011 + n.phase * 1.7) * 0.055;
        }
        n.vx *= 0.84; n.vy *= 0.84;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(n.r + 8, Math.min(W - n.r - 8, n.x));
        n.y = Math.max(n.r + 8, Math.min(H - n.r - 8, n.y));
      });
    }

    function drawFrame() {
      if (!inView) { running = false; return; }
      running = true;
      frame2++;
      ctx.clearRect(0, 0, W, H);

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n = nodes[i], m = nodes[j];
          if (n.cat !== m.cat) continue;
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d > 220) continue;
          const baseA = (1 - d / 220) * 0.28;
          const shimmer = 0.7 + Math.sin(frame2 * 0.035 + (i + j) * 0.5) * 0.3;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = COLORS[n.cat] + ah(baseA * shimmer);
          ctx.lineWidth = 1;
          ctx.stroke();
          // packet
          const seed = ((i * 17 + j * 31) % 100) / 100;
          const t = (frame2 * 0.0055 + seed) % 1;
          const sx = n.x + (m.x - n.x) * t;
          const sy = n.y + (m.y - n.y) * t;
          const fade = Math.min(t, 1 - t) * 4;
          const sa = Math.min(1, fade) * (1 - d / 220) * 0.75;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = COLORS[n.cat] + ah(sa);
          ctx.fill();
        }
      }

      // nodes
      nodes.forEach((n, i) => {
        const isH = hov === i;
        const r = isH ? n.r * 1.22 : n.r;
        const col = COLORS[n.cat];
        const breath = (Math.sin(frame2 * 0.025 + n.breathPhase) + 1) / 2;

        // halo
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * (1.35 + breath * 0.18), 0, Math.PI * 2);
        ctx.fillStyle = col + ah(0.05 + breath * 0.09);
        ctx.fill();

        if (isH) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 1.7, 0, Math.PI * 2);
          ctx.fillStyle = col + '22';
          ctx.fill();
        }

        // core
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = col + (isH ? 'ff' : '26');
        ctx.fill();
        ctx.strokeStyle = col + (isH ? 'ff' : '99');
        ctx.lineWidth = isH ? 2 : 1.2;
        ctx.stroke();

        ctx.font = `${isH ? 600 : 500} ${Math.max(11, 12 + (n.mass - 1) * 2.5)}px Geist, Inter, sans-serif`;
        ctx.fillStyle = isH ? '#f7f3ec' : '#1a1611';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
      });

      simStep();
      requestAnimationFrame(drawFrame);
    }

    // Pre-settle simulation
    for (let i = 0; i < 600; i++) simStep();
    presettling = false;

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          inView = e.isIntersecting;
          if (inView && !running) drawFrame();
        });
      }, { threshold: 0.05 });
      obs.observe(wrap);
    } else {
      drawFrame();
    }
  })();

  /* ─────────────────────────────────────────────────────────────
     MAGNETIC BUTTONS
     ───────────────────────────────────────────────────────────── */
  if (!IS_TOUCH && !PREFERS_REDUCED) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.18;
        const dy = (e.clientY - r.top - r.height / 2) * 0.18;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     3D MOUSE TILT — pop-out cards (data-tilt)
     ───────────────────────────────────────────────────────────── */
  if (!IS_TOUCH && !PREFERS_REDUCED) {
    const tiltEls = document.querySelectorAll('[data-tilt]');
    tiltEls.forEach((el) => {
      let raf = false, mx = 0, my = 0;
      const MAX = el.classList.contains('canvas-stage') ? 14
                : el.classList.contains('pub-card') ? 6
                : el.classList.contains('stat') ? 12
                : 10;
      function apply() {
        const r = el.getBoundingClientRect();
        const px = (mx - r.left) / r.width;
        const py = (my - r.top) / r.height;
        const tx = (0.5 - py) * MAX;
        const ty = (px - 0.5) * MAX;
        el.style.setProperty('--tx', tx.toFixed(2) + 'deg');
        el.style.setProperty('--ty', ty.toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        raf = false;
      }
      el.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!raf) { requestAnimationFrame(apply); raf = true; }
      });
      el.addEventListener('mouseenter', () => {
        el.classList.add('is-tilting');
        el.style.setProperty('--glare', '1');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--tx', '0deg');
        el.style.setProperty('--ty', '0deg');
        el.style.setProperty('--glare', '0');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     SUBTLE PARALLAX — section headers / hero watermark drift
     ───────────────────────────────────────────────────────────── */
  if (!PREFERS_REDUCED) {
    const wm = document.querySelector('.hero-watermark');
    const heroName = document.querySelector('.hero-name');
    let lastY = 0, prx = false;
    window.addEventListener('scroll', () => {
      lastY = window.scrollY;
      if (!prx) {
        requestAnimationFrame(() => {
          if (wm) wm.style.transform = `translate3d(0, ${lastY * 0.18}px, -160px)`;
          if (heroName) heroName.style.transform = `translate3d(0, ${lastY * -0.06}px, 0)`;
          prx = false;
        });
        prx = true;
      }
    }, { passive: true });
  }

})();
