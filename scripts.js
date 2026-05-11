/* =================================================================
   Rami Babas — Portfolio Scripts
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
      hud:     'NEURON',
      cssVar:  'oklch(62% 0.14 42)',
      rgb:     [192, 112, 74],
    },
    {
      phrase:  'Developing NGS workflows for genomic and transcriptomic analysis.',
      eyebrow: 'Genomics · NGS',
      hud:     'DNA HELIX',
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
     MARQUEE  —  runs continuously from page load, never stops
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

    const buildSet = () => keywords.map(k =>
      `<span class="marquee-item"><span class="marquee-diamond" aria-hidden="true"></span>${k}</span>`
    ).join('');

    // Two identical sets — when first set scrolls out, snap back to 0
    track.innerHTML = buildSet() + buildSet();

    let x = 0;
    const SPEED = 0.6; // px per frame (~36 px/s at 60 fps)
    let paused = false;
    let rafId;

    function tick() {
      if (!paused) {
        x -= SPEED;
        // halfWidth = width of one set; snap creates seamless loop
        const half = track.scrollWidth / 2;
        if (x <= -half) x = 0;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    // Pause on hover for readability
    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });

    // Kick off immediately — no scroll dependency
    tick();

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

    /* pi tracks which phrase to show — it is kept in sync with activeScene
       so the typed text always matches the canvas scene.  The scene change
       itself is driven solely by the 3-second auto-cycle (or a dot click). */
    let pi = 0, ci = 0, deleting = false;

    function loop() {
      /* Always follow the active scene; snap when the auto-cycle advances */
      if (pi !== activeScene && !deleting && ci === 0) {
        pi = activeScene;
      }
      const phrase = SCENES[pi].phrase;
      target.innerHTML = phrase.slice(0, ci) + '<span class="type-cursor"></span>';

      if (!deleting) {
        ci++;
        if (ci > phrase.length) {
          deleting = true;
          setTimeout(loop, HOLD_MS);
          return;
        }
        setTimeout(loop, TYPE_MS + Math.random() * TYPE_JIT);
      } else {
        ci--;
        if (ci < 0) {
          ci = 0;
          deleting = false;
          /* Advance phrase index to match the current active scene */
          pi = activeScene;
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
      if (canvasAPI) {
        canvasAPI.switchScene(i);   /* also resets the 3-second auto-cycle */
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────
     HERO CANVAS — continuous 3D morph (neuron → DNA → cell → circuit)
     Particles start scattered, assemble into each structure, then
     deconstruct and reform into the next every ~3s. The whole scene
     rotates continuously around the vertical axis. Pauses when
     offscreen; particle count drops on touch devices.
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
    window.addEventListener('orientationchange', () => setTimeout(sizeCanvas, 200));

    const W  = () => canvas.clientWidth  || 460;
    const H  = () => canvas.clientHeight || 460;
    const CX = () => W() / 2;
    const CY = () => H() / 2;

    /* ── Palette (RGB triplets matching --terra/--sage/--slate/--amber) ── */
    const TERRA = [192, 112, 74];
    const AMBER = [192, 144, 64];
    const SAGE  = [90, 138, 106];
    const SLATE = [74, 106, 138];
    const INK   = [15, 13, 10];
    const INK2  = [42, 36, 28];
    const INK3  = [107, 94, 77];
    const INK2_DARK = [216, 208, 191];
    const INK3_DARK = [150, 138, 118];

    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    /* Edge color follows theme so wires stay legible on dark mode */
    let EDGE_COL = INK2;
    let AMB_COL  = INK3;
    const refreshThemeColors = () => {
      const dark = document.body.dataset.theme === 'dark';
      EDGE_COL = dark ? INK2_DARK : INK2;
      AMB_COL  = dark ? INK3_DARK : INK3;
      /* Recolor existing ambient particles in place */
      particles.forEach(p => { if (p.role === 'amb') p.color = AMB_COL; });
    };

    /* ── Particle pool ── */
    const N = IS_TOUCH ? 90 : 120;
    const particles = Array.from({ length: N }, () => ({
      /* Scattered initial state — particles assemble into first scene from here */
      x: (Math.random() - 0.5) * 380,
      y: (Math.random() - 0.5) * 380,
      z: (Math.random() - 0.5) * 380,
      tx: 0, ty: 0, tz: 0,
      lerp: 0.05 + Math.random() * 0.06,
      role: 'free',
      color: INK3,
      size: 2.2,
      sx: 0, sy: 0, scale: 1, depth: 0,
      phase: Math.random() * Math.PI * 2,
      _pkt: null,
    }));

    refreshThemeColors();
    new MutationObserver(refreshThemeColors).observe(
      document.body, { attributes: true, attributeFilter: ['data-theme'] }
    );

    /* Edges array per scene, plus a fading copy of the prior scene's edges */
    let edges = [];
    let prevEdges = [];
    let edgeFade = 0;
    let prevEdgeFade = 1;

    /* ── Camera state ── */
    let rotY = 0;
    const tiltX = -0.32;             /* slight downward viewing angle */
    const ROT_SPEED = 0.0058;        /* radians per frame ≈ 18s per revolution */
    const CAM_Z = 460;
    const FOV   = 380;

    let frame = 0, inView = true, running = true, currentScene = 0;
    let parX = 0, parY = 0, pmx = 0, pmy = 0;

    /* ─────────────── SCENE 0 · NEURON ─────────────── */
    const NEU = { soma: 10, dends: 4, dendLen: 11, axonLen: 17, term: 6 };

    function setNeuron() {
      edges = [];
      let p = 0;
      const somaIdx = [];
      /* Soma — clustered nodes near origin */
      for (let i = 0; i < NEU.soma; i++) {
        const u = Math.random(), v = Math.random();
        const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
        const r = 16 + Math.random() * 10;
        const pt = particles[p];
        pt.tx = r * Math.sin(ph) * Math.cos(th);
        pt.ty = r * Math.cos(ph);
        pt.tz = r * Math.sin(ph) * Math.sin(th);
        pt.role = 'neu-soma'; pt.color = TERRA; pt.size = 3.4;
        somaIdx.push(p); p++;
      }
      /* Soma cross-links — gives the cell body visible structure */
      for (let i = 0; i < NEU.soma; i++) {
        edges.push([somaIdx[i], somaIdx[(i + 1) % NEU.soma], 0.45]);
        if (i % 2 === 0) edges.push([somaIdx[i], somaIdx[(i + 3) % NEU.soma], 0.25]);
      }

      /* Dendrites — curved branches outward from soma */
      for (let d = 0; d < NEU.dends; d++) {
        const baseAng = (d / NEU.dends) * Math.PI * 2 + 0.45;
        const elev = (d % 2 === 0 ? 0.45 : -0.25) + (d > 1 ? 0.15 : 0);
        const dirX = Math.cos(baseAng) * Math.cos(elev);
        const dirY = Math.sin(elev);
        const dirZ = Math.sin(baseAng) * Math.cos(elev);
        const bX = -dirZ, bZ = dirX; /* perpendicular for wave bend */
        const dIdx = [];
        for (let s = 0; s < NEU.dendLen; s++) {
          const t = (s + 1) / NEU.dendLen;
          const len = 22 + t * 138;
          const wave = Math.sin(t * 3.2 + d * 1.7) * 14 * (1 - t * 0.3);
          const pt = particles[p];
          pt.tx = dirX * len + bX * wave;
          pt.ty = dirY * len + Math.sin(t * 4 + d * 0.7) * 7;
          pt.tz = dirZ * len + bZ * wave;
          pt.role = 'neu-dend'; pt.color = INK2;
          pt.size = 2.5 - t * 1.0;
          dIdx.push(p); p++;
        }
        edges.push([somaIdx[d % NEU.soma], dIdx[0], 0.7]);
        for (let s = 0; s < dIdx.length - 1; s++) edges.push([dIdx[s], dIdx[s + 1], 0.6]);
      }

      /* Axon — single long branch heading out the back-corner */
      const axIdx = [];
      const aMag = Math.hypot(0.55, -0.55, -0.55);
      const aX = -0.55 / aMag, aY = -0.55 / aMag, aZ = -0.55 / aMag;
      const aPx = -aZ, aPz = aX;
      for (let s = 0; s < NEU.axonLen; s++) {
        const t = (s + 1) / NEU.axonLen;
        const len = 26 + t * 178;
        const swag = Math.sin(t * 5 + 0.7) * 14;
        const pt = particles[p];
        pt.tx = aX * len + aPx * swag * 0.35;
        pt.ty = aY * len - swag * 0.45;
        pt.tz = aZ * len + aPz * swag * 0.35;
        pt.role = 'neu-axon'; pt.color = INK2; pt.size = 1.9;
        axIdx.push(p); p++;
      }
      edges.push([somaIdx[1], axIdx[0], 0.85]);
      for (let s = 0; s < axIdx.length - 1; s++) edges.push([axIdx[s], axIdx[s + 1], 0.55]);

      /* Synaptic terminals at axon tip */
      const tipIdx = axIdx[axIdx.length - 1];
      const tip = particles[tipIdx];
      for (let i = 0; i < NEU.term; i++) {
        const th = (i / NEU.term) * Math.PI * 2;
        const ph = Math.acos(-0.5 + Math.random() * 1.0);
        const r = 14 + Math.random() * 10;
        const pt = particles[p];
        pt.tx = tip.tx + r * Math.sin(ph) * Math.cos(th);
        pt.ty = tip.ty + r * Math.cos(ph);
        pt.tz = tip.tz + r * Math.sin(ph) * Math.sin(th);
        pt.role = 'neu-term'; pt.color = TERRA; pt.size = 2.3;
        edges.push([tipIdx, p, 0.5]); p++;
      }

      /* Ambient drift — leftover particles float in the surrounding field */
      while (p < N) {
        const u = Math.random(), v = Math.random();
        const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
        const r = 170 + Math.random() * 70;
        const pt = particles[p];
        pt.tx = r * Math.sin(ph) * Math.cos(th);
        pt.ty = r * Math.cos(ph);
        pt.tz = r * Math.sin(ph) * Math.sin(th);
        pt.role = 'amb'; pt.color = AMB_COL; pt.size = 1.1;
        p++;
      }
    }

    /* ─────────────── SCENE 1 · DNA DOUBLE HELIX ─────────────── */
    const DNA = { pairs: 20, R: 78, H: 290, turns: 2.4, bases: ['A','T','G','C'] };
    let dnaLabels = [];

    function setDNA() {
      edges = []; dnaLabels = [];
      let p = 0;
      const sA = [], sB = [];
      for (let i = 0; i < DNA.pairs; i++) {
        const t = i / (DNA.pairs - 1);
        const ang = t * DNA.turns * Math.PI * 2;
        const y = (t - 0.5) * DNA.H;
        let pt = particles[p];
        pt.tx = Math.cos(ang) * DNA.R; pt.ty = y; pt.tz = Math.sin(ang) * DNA.R;
        pt.role = 'dna-a'; pt.color = SAGE; pt.size = 2.9;
        sA.push(p++);
        pt = particles[p];
        pt.tx = Math.cos(ang + Math.PI) * DNA.R; pt.ty = y; pt.tz = Math.sin(ang + Math.PI) * DNA.R;
        pt.role = 'dna-b'; pt.color = TERRA; pt.size = 2.9;
        sB.push(p++);
        const ba = Math.floor(Math.random() * 4);
        const bb = ba < 2 ? 1 - ba : 5 - ba;  /* A↔T, G↔C */
        dnaLabels.push([DNA.bases[ba], DNA.bases[bb]]);
      }
      /* Sugar-phosphate backbones */
      for (let i = 0; i < sA.length - 1; i++) {
        edges.push([sA[i], sA[i + 1], 0.9]);
        edges.push([sB[i], sB[i + 1], 0.9]);
      }
      /* Base-pair rungs */
      for (let i = 0; i < sA.length; i++) edges.push([sA[i], sB[i], 0.35]);

      while (p < N) {
        const y = (Math.random() - 0.5) * (DNA.H + 70);
        const r = DNA.R + 28 + Math.random() * 80;
        const ang = Math.random() * Math.PI * 2;
        const pt = particles[p];
        pt.tx = r * Math.cos(ang); pt.ty = y; pt.tz = r * Math.sin(ang);
        pt.role = 'amb'; pt.color = AMB_COL; pt.size = 1.1;
        p++;
      }
    }

    /* ─────────────── SCENE 2 · SPHERICAL CELL ─────────────── */
    const CELL = { mem: 56, nuc: 14, R: 142, nucR: 48 };

    function setCell() {
      edges = [];
      let p = 0;
      const memIdx = [];
      const GA = Math.PI * (3 - Math.sqrt(5)); /* golden angle */

      /* Membrane — Fibonacci sphere = evenly spaced points */
      for (let i = 0; i < CELL.mem; i++) {
        const y = 1 - (i / (CELL.mem - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const th = GA * i;
        const pt = particles[p];
        pt.tx = CELL.R * Math.cos(th) * r;
        pt.ty = CELL.R * y;
        pt.tz = CELL.R * Math.sin(th) * r;
        pt.role = 'cell-mem'; pt.color = TERRA; pt.size = 2.3;
        memIdx.push(p); p++;
      }

      /* Membrane wireframe — each node links its 2 nearest neighbors */
      const memPos = memIdx.map(i => ({
        x: particles[i].tx, y: particles[i].ty, z: particles[i].tz,
      }));
      for (let i = 0; i < memIdx.length; i++) {
        const me = memPos[i];
        const dists = [];
        for (let j = 0; j < memPos.length; j++) {
          if (j === i) continue;
          const m = memPos[j];
          dists.push([j, (me.x - m.x) ** 2 + (me.y - m.y) ** 2 + (me.z - m.z) ** 2]);
        }
        dists.sort((a, b) => a[1] - b[1]);
        for (let k = 0; k < 2; k++) {
          const [j] = dists[k];
          if (i < j) edges.push([memIdx[i], memIdx[j], 0.45]);
        }
      }

      /* Nucleus — smaller offset sphere with its own ring */
      const nucCenter = { x: 6, y: -10, z: 14 };
      const nucIdx = [];
      for (let i = 0; i < CELL.nuc; i++) {
        const y = 1 - (i / (CELL.nuc - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const th = GA * i + 1.7;
        const pt = particles[p];
        pt.tx = nucCenter.x + CELL.nucR * Math.cos(th) * r;
        pt.ty = nucCenter.y + CELL.nucR * y;
        pt.tz = nucCenter.z + CELL.nucR * Math.sin(th) * r;
        pt.role = 'cell-nuc'; pt.color = SLATE; pt.size = 2.5;
        nucIdx.push(p); p++;
      }
      for (let i = 0; i < nucIdx.length; i++) {
        edges.push([nucIdx[i], nucIdx[(i + 1) % nucIdx.length], 0.55]);
      }

      /* Organelles — small clusters in cytoplasm */
      const numClusters = 4;
      const totalOrg = N - p - 12;
      const perCluster = Math.max(4, Math.floor(totalOrg / numClusters));
      for (let c = 0; c < numClusters; c++) {
        const th = (c / numClusters) * Math.PI * 2 + 0.7;
        const ph = (c % 2 ? 0.7 : -0.6);
        const rad = CELL.nucR + 28 + (c % 2) * 20;
        const cx = rad * Math.cos(ph) * Math.cos(th);
        const cy = rad * Math.sin(ph);
        const cz = rad * Math.cos(ph) * Math.sin(th);
        const ci = [];
        for (let i = 0; i < perCluster && p < N - 6; i++) {
          const u = Math.random(), v = Math.random();
          const tt = 2 * Math.PI * u, pp = Math.acos(2 * v - 1);
          const rr = 5 + Math.random() * 11;
          const pt = particles[p];
          pt.tx = cx + rr * Math.sin(pp) * Math.cos(tt);
          pt.ty = cy + rr * Math.cos(pp);
          pt.tz = cz + rr * Math.sin(pp) * Math.sin(tt);
          pt.role = 'cell-org'; pt.color = (c % 2) ? SAGE : AMBER; pt.size = 1.8;
          ci.push(p); p++;
        }
        for (let i = 0; i < ci.length - 1; i++) edges.push([ci[i], ci[i + 1], 0.3]);
      }

      while (p < N) {
        const u = Math.random(), v = Math.random();
        const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
        const r = 30 + Math.random() * (CELL.R - 50);
        const pt = particles[p];
        pt.tx = r * Math.sin(ph) * Math.cos(th);
        pt.ty = r * Math.cos(ph);
        pt.tz = r * Math.sin(ph) * Math.sin(th);
        pt.role = 'amb'; pt.color = AMB_COL; pt.size = 1.0;
        p++;
      }
    }

    /* ─────────────── SCENE 3 · CIRCUIT (3D lattice) ─────────────── */
    const CIR = { g: 4, sp: 56 }; /* 4³ lattice = 64 nodes */
    let cirEdgeIdx = [];

    function setCircuit() {
      edges = []; cirEdgeIdx = [];
      let p = 0;
      const grid = Array.from({ length: CIR.g }, () =>
        Array.from({ length: CIR.g }, () => new Array(CIR.g))
      );
      for (let gx = 0; gx < CIR.g; gx++) {
        for (let gy = 0; gy < CIR.g; gy++) {
          for (let gz = 0; gz < CIR.g; gz++) {
            if (p >= N - 24) break;
            const pt = particles[p];
            pt.tx = (gx - (CIR.g - 1) / 2) * CIR.sp;
            pt.ty = (gy - (CIR.g - 1) / 2) * CIR.sp;
            pt.tz = (gz - (CIR.g - 1) / 2) * CIR.sp;
            pt.role = 'cir-node'; pt.color = AMBER; pt.size = 2.7;
            grid[gx][gy][gz] = p; p++;
          }
        }
      }
      /* Deterministic sparse wiring — only some axis-aligned neighbors */
      const hash = (a, b, c, s) =>
        ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791) ^ s) >>> 0;
      for (let gx = 0; gx < CIR.g; gx++) {
        for (let gy = 0; gy < CIR.g; gy++) {
          for (let gz = 0; gz < CIR.g; gz++) {
            const me = grid[gx][gy][gz];
            if (me === undefined) continue;
            if (gx < CIR.g - 1) {
              const nb = grid[gx + 1][gy][gz];
              if (nb !== undefined && (hash(gx, gy, gz, 1) % 100) < 62) {
                edges.push([me, nb, 0.5]); cirEdgeIdx.push([me, nb]);
              }
            }
            if (gy < CIR.g - 1) {
              const nb = grid[gx][gy + 1][gz];
              if (nb !== undefined && (hash(gx, gy, gz, 2) % 100) < 58) {
                edges.push([me, nb, 0.5]); cirEdgeIdx.push([me, nb]);
              }
            }
            if (gz < CIR.g - 1) {
              const nb = grid[gx][gy][gz + 1];
              if (nb !== undefined && (hash(gx, gy, gz, 3) % 100) < 58) {
                edges.push([me, nb, 0.5]); cirEdgeIdx.push([me, nb]);
              }
            }
          }
        }
      }

      /* Data packets — fly along random circuit traces */
      while (p < N) {
        const tr = cirEdgeIdx[Math.floor(Math.random() * cirEdgeIdx.length)] || [0, 1];
        const pt = particles[p];
        pt.tx = particles[tr[0]].tx;
        pt.ty = particles[tr[0]].ty;
        pt.tz = particles[tr[0]].tz;
        pt.role = 'cir-pkt'; pt.color = TERRA; pt.size = 1.6;
        pt._pkt = { a: tr[0], b: tr[1], t: Math.random(), spd: 0.006 + Math.random() * 0.01 };
        p++;
      }
    }

    function updateCircuitPackets() {
      particles.forEach((p) => {
        if (p.role !== 'cir-pkt' || !p._pkt) return;
        p._pkt.t += p._pkt.spd;
        if (p._pkt.t > 1) {
          p._pkt.t = 0;
          const tr = cirEdgeIdx[Math.floor(Math.random() * cirEdgeIdx.length)];
          if (tr) { p._pkt.a = tr[0]; p._pkt.b = tr[1]; }
        }
        const a = particles[p._pkt.a], b = particles[p._pkt.b];
        if (a && b) {
          p.tx = a.tx + (b.tx - a.tx) * p._pkt.t;
          p.ty = a.ty + (b.ty - a.ty) * p._pkt.t;
          p.tz = a.tz + (b.tz - a.tz) * p._pkt.t;
        }
      });
    }

    /* ─── Scene swap plumbing — keeps the same `switchScene` contract ─── */
    const SET_FNS = [setNeuron, setDNA, setCell, setCircuit];

    function switchScene(i) {
      if (i === currentScene) return;
      prevEdges = edges.slice();
      edgeFade = 0;
      prevEdgeFade = 1;
      /* Strip packet metadata when leaving the circuit scene */
      particles.forEach(p => { if (p.role !== 'cir-pkt') p._pkt = null; });
      currentScene = i;
      SET_FNS[i]();
    }

    /* Init — particles already scattered randomly above; first scene assembles them */
    setNeuron();

    /* ── Auto-cycle: advance to the next scene every 3 s ── */
    let cycleTimer = null;
    function restartAutoCycle() {
      clearInterval(cycleTimer);
      if (PREFERS_REDUCED) return;
      cycleTimer = setInterval(() => {
        const next = (currentScene + 1) % 4;
        switchScene(next);
        applyScene(next);          /* keep HUD, eyebrow + accent colour in sync */
      }, 3000);
    }
    restartAutoCycle();
    window.addEventListener('pagehide', () => clearInterval(cycleTimer));

    /* Mouse parallax — gentle camera-position offset */
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      pmx = (e.clientX - r.left) * (W() / r.width)  - CX();
      pmy = (e.clientY - r.top)  * (H() / r.height) - CY();
    });
    canvas.addEventListener('mouseleave', () => { pmx = 0; pmy = 0; });

    /* Pause when offscreen */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          inView = e.isIntersecting;
          if (inView && !running) { running = true; render(); }
        });
      }, { threshold: 0 }).observe(canvas);
    }

    /* ─── Render loop ─── */
    function render() {
      if (!inView) { running = false; return; }
      running = true;
      frame++;
      ctx.clearRect(0, 0, W(), H());

      /* Continuous yaw — keeps the scene always rotating */
      rotY += ROT_SPEED;

      /* Parallax (subtle) */
      parX += (pmx * 0.04 - parX) * 0.06;
      parY += (pmy * 0.04 - parY) * 0.06;

      /* Edge fade as scenes swap */
      edgeFade     += (1 - edgeFade) * 0.08;
      prevEdgeFade += (0 - prevEdgeFade) * 0.11;

      /* Circuit packets flow along their traces */
      if (currentScene === 3) updateCircuitPackets();

      /* Per-frame trig — reused for every particle */
      const cyY = Math.cos(rotY), syY = Math.sin(rotY);
      const cxX = Math.cos(tiltX), sxX = Math.sin(tiltX);
      const cxOrigin = CX() + parX;
      const cyOrigin = CY() + parY;

      /* Lerp toward targets, then project into 2D screen space */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += (p.tx - p.x) * p.lerp;
        p.y += (p.ty - p.y) * p.lerp;
        p.z += (p.tz - p.z) * p.lerp;
        if (p.role === 'amb') {
          /* Gentle breathing for ambient floaters */
          const b = Math.sin(frame * 0.018 + p.phase) * 2.5;
          p.x += Math.cos(p.phase + frame * 0.005) * 0.18;
          p.y += b * 0.05;
          p.z += Math.sin(p.phase + frame * 0.005) * 0.18;
        }
        /* Yaw (Y axis) then pitch (X axis), perspective project */
        const X =  p.x * cyY + p.z * syY;
        const Z = -p.x * syY + p.z * cyY;
        const Y2 = p.y * cxX - Z * sxX;
        const Z2 = p.y * sxX + Z * cxX;
        const sc = FOV / Math.max(60, CAM_Z - Z2);
        p.sx = cxOrigin + X * sc;
        p.sy = cyOrigin + Y2 * sc;
        p.scale = sc;
        p.depth = Z2;
      }

      /* Edges first (depth-faded), then per-scene decor, then particles */
      drawEdges(prevEdges, prevEdgeFade);
      drawEdges(edges, edgeFade);
      drawSceneDecor(cxOrigin, cyOrigin);
      drawParticles();

      requestAnimationFrame(render);
    }

    function drawEdges(arr, mult) {
      if (mult < 0.02) return;
      ctx.lineCap = 'round';
      ctx.lineWidth = 0.95;
      for (let k = 0; k < arr.length; k++) {
        const e = arr[k];
        const a = particles[e[0]], b = particles[e[1]];
        if (!a || !b) continue;
        const avg = (a.depth + b.depth) / 2;
        const dF = 0.4 + Math.max(0, Math.min(1, (avg + 240) / 420)) * 0.6;
        const alpha = e[2] * 0.5 * dF * mult;
        if (alpha < 0.02) continue;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = rgba(EDGE_COL, alpha);
        ctx.stroke();
      }
    }

    function drawSceneDecor(ox, oy) {
      ctx.save();
      if (currentScene === 1) {
        /* DNA base-pair labels (A/T/G/C) */
        ctx.font = '8.5px JetBrains Mono, monospace';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < DNA.pairs; i++) {
          const a = particles[i * 2], b = particles[i * 2 + 1];
          if (!a || !b || a.role !== 'dna-a') continue;
          const dF = 0.45 + Math.max(0, Math.min(1, (a.depth + 240) / 420)) * 0.55;
          const lbl = dnaLabels[i];
          if (!lbl) continue;
          ctx.fillStyle = rgba(SAGE, 0.6 * dF);
          ctx.textAlign = a.sx > ox ? 'left' : 'right';
          ctx.fillText(lbl[0], a.sx + (a.sx > ox ? 6 : -6), a.sy);
          ctx.fillStyle = rgba(TERRA, 0.6 * dF);
          ctx.textAlign = b.sx > ox ? 'left' : 'right';
          ctx.fillText(lbl[1], b.sx + (b.sx > ox ? 6 : -6), b.sy);
        }
      } else if (currentScene === 3) {
        /* Circuit: small square frames at lattice nodes */
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.role !== 'cir-node') continue;
          const dF = 0.45 + Math.max(0, Math.min(1, (p.depth + 240) / 420)) * 0.55;
          const s = 5.5 * p.scale;
          ctx.strokeStyle = rgba(AMBER, 0.42 * dF);
          ctx.lineWidth = 0.8;
          ctx.strokeRect(p.sx - s, p.sy - s, s * 2, s * 2);
        }
      } else if (currentScene === 2) {
        /* Cell: soft silhouette ring */
        const r = CELL.R * FOV / CAM_Z * 0.98;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(TERRA, 0.15);
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (currentScene === 0) {
        /* Neuron: pulsing soma halo */
        const pulse = 0.6 + Math.sin(frame * 0.04) * 0.4;
        const r0 = 30 * FOV / CAM_Z;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r0 * 2.2);
        g.addColorStop(0, rgba(TERRA, 0.13 * pulse));
        g.addColorStop(1, rgba(TERRA, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, r0 * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawParticles() {
      /* Back-to-front sort for correct overlap */
      const sorted = particles.slice().sort((a, b) => a.depth - b.depth);
      for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        const r = Math.max(0.6, p.size * (0.45 + p.scale * 0.7));
        const dF = 0.45 + Math.max(0, Math.min(1, (p.depth + 240) / 420)) * 0.55;
        const alpha = 0.5 + dF * 0.5;
        if (r > 1.8) {
          /* drop shadow */
          ctx.beginPath();
          ctx.arc(p.sx + 1, p.sy + 1.4, r, 0, Math.PI * 2);
          ctx.fillStyle = rgba(INK, 0.06 * dF);
          ctx.fill();
          /* shaded sphere */
          const g = ctx.createRadialGradient(p.sx - r * 0.35, p.sy - r * 0.35, 0, p.sx, p.sy, r);
          g.addColorStop(0, rgba(p.color, alpha));
          g.addColorStop(1, rgba(p.color, alpha * 0.55));
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        } else {
          /* tiny ambient dots — flat fill is much cheaper */
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = rgba(p.color, alpha * 0.9);
          ctx.fill();
        }
      }
    }

    if (!PREFERS_REDUCED) {
      render();
    } else {
      /* single static frame */
      render();
      running = false;
    }

    canvasAPI = {
      /* Called by typing effect and scene-dot clicks.
         Morphs the canvas AND resets the 3-second auto-cycle so a manual
         scene change always gets the full display window before auto-advancing. */
      switchScene(i) { switchScene(i); restartAutoCycle(); },
      restartAutoCycle,
    };
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
