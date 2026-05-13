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
      hud:     'AI BRAIN',
      cssVar:  'oklch(62% 0.14 42)',
      rgb:     [192, 112, 74],
    },
    {
      phrase:  'Developing NGS workflows for genomic and transcriptomic analysis.',
      eyebrow: 'Genomics · NGS',
      hud:     'DNA',
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

    // Inline script in index.html already populates items + drives CSS animation.
    // Only inject here if it's still empty (defensive).
    if (!track.children.length) track.innerHTML = buildSet() + buildSet();
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
    const N = IS_TOUCH ? 120 : 180;
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
    const FOV   = 620;

    let frame = 0, inView = true, running = true, currentScene = 0;
    let parX = 0, parY = 0, pmx = 0, pmy = 0;

    /* ─────────────── SCENE 0 · 3D BRAIN POINT CLOUD ─────────────── */
    /* A brain silhouette built from points sampled on a deformed
       ellipsoid with surface noise = gyri/sulci. Each surface point
       is wired to its 2-3 nearest neighbors so the mesh reads as a
       glowing wireframe brain. A few interior "neurons" fire on
       random cycles in accent colors. */
    const BRAIN = { surface: 110, fire: 14, rxBase: 165, ryBase: 115, rzBase: 130 };

    function brainPoint(theta, phi) {
      /* Base ellipsoid */
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.cos(phi);
      const sz = Math.sin(phi) * Math.sin(theta);

      /* Surface noise — multiple frequencies = brain gyri */
      const fold =
        Math.sin(theta * 7 + Math.cos(phi * 4) * 1.5) * 0.055 +
        Math.cos(phi * 6 + theta * 3) * 0.045 +
        Math.sin(theta * 11 - phi * 9) * 0.022 +
        Math.cos(theta * 4 - phi * 2) * 0.03;

      /* Two-lobe valley along the sagittal plane (front-to-back groove
         at theta ≈ 0 and theta ≈ π) — makes the hemispheres read */
      const sagittal = Math.cos(theta) ** 2;          /* 1 at front/back, 0 at sides */
      const valley = -0.05 * Math.exp(-Math.pow(sy * 1.8, 2)) * (1 - sagittal);
      /* Actually we want the valley to run top of the head, between hemispheres */
      const topValley = -0.07 * Math.exp(-Math.pow((sx) * 4.0, 2)) * Math.max(0, sy);

      /* Flatten the bottom a bit (skull base) */
      const bottomFlat = sy < 0 ? -0.06 * Math.pow(-sy, 2.2) : 0;

      const r = 1 + fold + valley + topValley + bottomFlat;
      return {
        x: r * BRAIN.rxBase * sx,
        y: r * BRAIN.ryBase * sy,
        z: r * BRAIN.rzBase * sz,
      };
    }

    function setNeuralNet() {
      edges = [];
      let p = 0;

      /* Fibonacci sphere sampling — evenly-spaced points on the sphere,
         then warp each through brainPoint to land on the brain surface */
      const surf = BRAIN.surface;
      const surfPts = [];
      const surfIdx = [];
      const GA = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < surf && p < N - BRAIN.fire - 8; i++) {
        const y = 1 - (i / (surf - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = GA * i;
        const phi = Math.acos(y);
        const pos = brainPoint(theta, phi);
        const pt = particles[p];
        pt.tx = pos.x; pt.ty = pos.y; pt.tz = pos.z;
        pt.role = 'brain-surf';
        pt.color = INK2;
        pt.size = 1.9;
        pt._fireT = Math.random() * 6;
        pt._fireSpd = 0.012 + Math.random() * 0.018;
        surfPts.push({ id: p, x: pos.x, y: pos.y, z: pos.z });
        surfIdx.push(p);
        p++;
      }

      /* Neighbor wiring — k nearest neighbors per surface point.
         Using i<j to avoid duplicate edges. */
      const K = 3;
      for (let i = 0; i < surfPts.length; i++) {
        const me = surfPts[i];
        const dists = [];
        for (let j = 0; j < surfPts.length; j++) {
          if (j === i) continue;
          const o = surfPts[j];
          const d2 = (me.x - o.x) ** 2 + (me.y - o.y) ** 2 + (me.z - o.z) ** 2;
          dists.push([j, d2]);
        }
        dists.sort((a, b) => a[1] - b[1]);
        for (let k = 0; k < K; k++) {
          const [j] = dists[k];
          if (i < j) edges.push([me.id, surfPts[j].id, 0.45]);
        }
      }

      /* Firing neurons — bright pulsing nodes scattered inside */
      for (let i = 0; i < BRAIN.fire && p < N - 4; i++) {
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u, phi = Math.acos(2 * v - 1);
        const rScale = 0.55 + Math.random() * 0.35;
        const pt = particles[p];
        pt.tx = BRAIN.rxBase * rScale * Math.sin(phi) * Math.cos(theta);
        pt.ty = BRAIN.ryBase * rScale * Math.cos(phi);
        pt.tz = BRAIN.rzBase * rScale * Math.sin(phi) * Math.sin(theta);
        pt.role = 'brain-fire';
        pt.color = TERRA;
        pt.size = 3.6;
        pt._fireT = Math.random() * 6;
        pt._fireSpd = 0.025 + Math.random() * 0.04;
        p++;
      }

      /* Ambient halo — sparse cloud around the brain */
      while (p < N) {
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u, phi = Math.acos(2 * v - 1);
        const r = 195 + Math.random() * 60;
        const pt = particles[p];
        pt.tx = r * Math.sin(phi) * Math.cos(theta);
        pt.ty = r * Math.cos(phi);
        pt.tz = r * Math.sin(phi) * Math.sin(theta);
        pt.role = 'amb'; pt.color = AMB_COL; pt.size = 1.0;
        p++;
      }
    }
    const setNeuron = setNeuralNet;

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
    const CELL = { mem: 96, nuc: 22, R: 142, nucR: 52 };

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
        /* Brain neurons fire on independent cycles */
        if (p.role === 'brain-fire' || p.role === 'brain-surf') {
          p._fireT = (p._fireT || 0) + (p._fireSpd || 0.02);
          /* Half-sin pulse: 0 most of the time, 1 at peak */
          const cyc = (p._fireT % (Math.PI * 2));
          p._fire = Math.max(0, Math.sin(cyc)) ** 4;
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
        /* DNA base-pair labels (A/T/G/C) — front-and-center */
        ctx.font = 'bold 14px JetBrains Mono, monospace';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < DNA.pairs; i++) {
          const a = particles[i * 2], b = particles[i * 2 + 1];
          if (!a || !b || a.role !== 'dna-a') continue;
          const dF = 0.45 + Math.max(0, Math.min(1, (a.depth + 240) / 420)) * 0.55;
          const lbl = dnaLabels[i];
          if (!lbl) continue;
          /* Letter A on sage strand */
          ctx.fillStyle = rgba(SAGE, 0.95 * dF);
          ctx.textAlign = a.sx > ox ? 'left' : 'right';
          ctx.fillText(lbl[0], a.sx + (a.sx > ox ? 10 : -10), a.sy);
          /* Complement on terra strand */
          ctx.fillStyle = rgba(TERRA, 0.95 * dF);
          ctx.textAlign = b.sx > ox ? 'left' : 'right';
          ctx.fillText(lbl[1], b.sx + (b.sx > ox ? 10 : -10), b.sy);
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
        /* Brain: soft glow halos around firing neurons, plus pulsing soma */
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.role !== 'brain-fire' || !p._fire) continue;
          const dF = 0.45 + Math.max(0, Math.min(1, (p.depth + 240) / 420)) * 0.55;
          const r0 = 18 * p.scale * (0.8 + p._fire * 1.6);
          const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r0);
          g.addColorStop(0, rgba(TERRA, 0.38 * p._fire * dF));
          g.addColorStop(0.4, rgba(TERRA, 0.16 * p._fire * dF));
          g.addColorStop(1, rgba(TERRA, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawParticles() {
      /* Back-to-front sort for correct overlap */
      const sorted = particles.slice().sort((a, b) => a.depth - b.depth);
      for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        let r = Math.max(0.6, p.size * (0.45 + p.scale * 0.7));
        let alpha = 0.5 + (0.45 + Math.max(0, Math.min(1, (p.depth + 240) / 420)) * 0.55) * 0.5;
        const dF = 0.45 + Math.max(0, Math.min(1, (p.depth + 240) / 420)) * 0.55;
        alpha = 0.5 + dF * 0.5;
        /* Brain neurons pulse — surface ones blink subtly, firing ones flare bright */
        if (p.role === 'brain-fire') {
          r *= 1 + (p._fire || 0) * 0.9;
          alpha = Math.min(1, alpha + (p._fire || 0) * 0.4);
        } else if (p.role === 'brain-surf') {
          alpha = Math.min(1, alpha * (0.55 + (p._fire || 0) * 0.45));
        }
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
     HORIZONTAL 3D CAROUSEL — auto-scrolling + drag + keyboard.
     Used by the Career timeline and Education sections. Children
     of the inner track are duplicated for a seamless infinite loop.
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll('[data-carousel]').forEach((wrap) => {
    const viewport = wrap.querySelector('.hcar-viewport');
    const track = viewport.querySelector('.timeline, .edu-grid');
    if (!track) return;
    const items = Array.from(track.children);
    if (!items.length) return;

    /* Clear any IntersectionObserver-style staged opacity from reveal logic.
       We do our own visibility per-card. */
    items.forEach((el) => {
      el.classList.add('is-visible');
      el.style.transitionDelay = '0s';
    });

    /* Duplicate once so the loop is seamless when we wrap offset back. */
    items.forEach((item) => {
      const c = item.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.dataset.clone = '1';
      track.appendChild(c);
    });

    /* Measure one set's width AFTER layout has settled. */
    let setWidth = 0;
    function measure() {
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += items[i].getBoundingClientRect().width;
        if (i < items.length - 1) total += gap;
      }
      setWidth = total + gap;     /* + one trailing gap so cloned set butts up cleanly */
    }
    measure();

    /* Speed = pixels per frame. Slow enough to read each card. */
    const SPEED = PREFERS_REDUCED ? 0 : 0.45;
    const RESUME_AFTER = 2800;     /* ms idle before auto resumes */

    let offset = 0;
    let auto = !PREFERS_REDUCED;
    let lastUser = -Infinity;
    let isDragging = false;
    let dragStartX = 0, dragStartOff = 0;
    let velocity = 0;
    let inView = true;

    /* Initial offset: place the first card centered, which means
       starting halfway through one card's width on the front padding. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measure();
        applyTransforms();
      });
    });

    /* Drag handlers */
    viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      auto = false;
      dragStartX = e.clientX;
      dragStartOff = offset;
      velocity = 0;
      viewport.setPointerCapture?.(e.pointerId);
      viewport.classList.add('is-grabbing');
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const newOff = dragStartOff - dx;
      velocity = (newOff - offset);
      offset = newOff;
      lastUser = performance.now();
    });
    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      lastUser = performance.now();
      viewport.classList.remove('is-grabbing');
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', endDrag);

    /* Wheel — horizontal flick advances; vertical scrolls page normally */
    viewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        auto = false;
        offset += e.deltaX;
        lastUser = performance.now();
      }
    }, { passive: false });

    /* Keyboard nav when viewport has focus */
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e) => {
      const allItems = track.children;
      const step = allItems[0] ? allItems[0].getBoundingClientRect().width + 28 : 400;
      if (e.key === 'ArrowRight') { offset += step; auto = false; lastUser = performance.now(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { offset -= step; auto = false; lastUser = performance.now(); e.preventDefault(); }
    });

    /* Pause on hover (desktop only). Touch users get the idle-resume. */
    if (!IS_TOUCH) {
      viewport.addEventListener('mouseenter', () => { auto = false; });
      viewport.addEventListener('mouseleave', () => { auto = true; lastUser = -Infinity; });
    }

    /* Pause when section is offscreen */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => { inView = e.isIntersecting; });
      }, { threshold: 0 }).observe(wrap);
    }

    let rafPrev = 0;

    function applyTransforms() {
      /* Wrap offset so we always live in [0, setWidth) */
      if (setWidth > 0) {
        while (offset < 0) offset += setWidth;
        while (offset >= setWidth) offset -= setWidth;
      }
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;

      /* Update per-card --d / --abs and find which is closest to center.
         We do this against the visual position (not just CSS offsets) so
         we use getBoundingClientRect for accuracy. */
      const vpRect = viewport.getBoundingClientRect();
      const center = vpRect.left + vpRect.width / 2;
      let minAbs = Infinity, focusEl = null;
      const all = track.children;
      for (let i = 0; i < all.length; i++) {
        const r = all[i].getBoundingClientRect();
        const w = r.width || 1;
        const d = (r.left + r.width / 2 - center) / w;
        const abs = Math.min(Math.abs(d), 3);
        all[i].style.setProperty('--d', d.toFixed(3));
        all[i].style.setProperty('--abs', abs.toFixed(3));
        if (abs < minAbs && !all[i].dataset.cloneFar) {
          minAbs = abs;
          focusEl = all[i];
        }
      }
      /* Toggle is-focus class on the closest card */
      for (let i = 0; i < all.length; i++) {
        all[i].classList.toggle('is-focus', all[i] === focusEl);
      }
    }

    function frame(now) {
      if (!inView) { rafPrev = now; requestAnimationFrame(frame); return; }
      const dt = rafPrev ? (now - rafPrev) : 16;
      rafPrev = now;

      if (auto && !isDragging) {
        offset += SPEED * (dt / 16);
      } else if (!isDragging && Math.abs(velocity) > 0.2) {
        /* glide on release */
        offset += velocity;
        velocity *= 0.92;
      }

      if (!isDragging && !auto && (now - lastUser) > RESUME_AFTER) {
        auto = true;
      }

      applyTransforms();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* Re-measure on resize */
    window.addEventListener('resize', () => {
      const prevWidth = setWidth;
      measure();
      /* Keep visual position roughly stable across resize */
      if (prevWidth) offset = (offset / prevWidth) * setWidth;
    });
  });

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
