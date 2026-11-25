/* The service wheel: an SVG dial of six colour wedges.
   The wedge that reaches the pointer floods its colour into the page.
   Drag to spin (with inertia + snap), click a wedge, or use arrow keys. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const rad = d => d * Math.PI / 180;
  const LOGO = `
    <path d="M0 0H58L144 134L207 0H266L176 156L276 338H216L146 211L68 338H9L116 157L0 0Z" fill="#35B8C5"/>
    <path d="M309 0H516V55H364L309 0Z" fill="#F57B20"/><path d="M300 138H516V195H300V138Z" fill="#F57B20"/>
    <path d="M352 275H516V338H299L352 275Z" fill="#F57B20"/><path d="M146 100H221L189 157H126L146 100Z" fill="#F57B20"/>
    <path d="M190 11C218.719 11 242 34.2812 242 63C242 91.7188 218.719 115 190 115C161.281 115 138 91.7188 138 63C138 34.2812 161.281 11 190 11ZM190 27C170.118 27 154 43.1177 154 63C154 82.8823 170.118 99 190 99C209.882 99 226 82.8823 226 63C226 43.1177 209.882 27 190 27Z" fill="#F57B20"/>`;
  const ICONS = {
    staffing: `<g class="ic-bob"><circle cx="0" cy="-6" r="6"/><path d="M-11 12a11 10 0 0 1 22 0"/></g>`,
    permits: `<g class="ic-press"><path d="M-4 -14h8v9h-8z"/><path d="M-10 -5h20v6h-20z"/></g><path d="M-12 8h24"/>`,
    it: `<path d="M-11 -11h7v7h-7zM4 -11h7v7h-7zM-11 4h7v7h-7zM4 4h3M9 4v3M4 9h7"/><path class="ic-scan" d="M-14 0h28" stroke-width="2.4"/>`,
    production: `<g class="ic-spin"><path d="M0 -12l11 6v12l-11 6-11-6v-12z"/><path d="M0 0l11 -6M0 0v12M0 0l-11 -6"/></g>`,
    media: `<rect x="-12" y="-8" width="24" height="17" rx="3"/><circle cx="0" cy="0.5" r="5"/><circle class="ic-blink" cx="8" cy="-4" r="1.6" fill="currentColor"/>`,
    coordination: `<rect x="-9" y="-12" width="18" height="24" rx="3"/><path class="ic-check" d="M-4 1l3 3 6-7"/>`
  };

  XE.Wheel = function (svg, services, cb) {
    const N = services.length, STEP = 360 / N;
    const R1 = 238, R2 = 486, GAP = .7;
    let P = cb.pointer();
    let rot = P, active = 0, tween = null, dragging = false;

    svg.innerHTML = '';
    const defs = sv('defs', {}, svg);
    defs.innerHTML = `<path id="hubRing" d="M0 -200A200 200 0 1 1 0 200A200 200 0 1 1 0 -200"/>`;

    const gTicks = sv('g', { class: 'ticks' }, svg);
    const gW = sv('g', { class: 'wedges' }, svg);
    const gHub = sv('g', { class: 'hub', role: 'button', tabindex: 0, 'aria-label': 'Pause or resume auto-rotation' }, svg);
    const gPtr = sv('g', { class: 'ptr', 'pointer-events': 'none' }, svg);

    // dial ticks
    for (let i = 0; i < 120; i++) {
      const major = i % 20 === 0, mid = i % 5 === 0;
      const a = rad(i * 3 + STEP / 2), r0 = major ? 494 : 498, r1 = major ? 518 : mid ? 510 : 506;
      sv('line', {
        x1: Math.cos(a) * r0, y1: Math.sin(a) * r0, x2: Math.cos(a) * r1, y2: Math.sin(a) * r1,
        stroke: 'var(--ink)', 'stroke-width': major ? 3 : 1.5, 'stroke-opacity': major ? .9 : .45, 'stroke-linecap': 'round'
      }, gTicks);
    }

    // wedges
    const arc = (r, a) => [Math.cos(rad(a)) * r, Math.sin(rad(a)) * r];
    const sector = (a0, a1) => {
      const [x0, y0] = arc(R2, a0), [x1, y1] = arc(R2, a1), [x2, y2] = arc(R1, a1), [x3, y3] = arc(R1, a0);
      return `M${x0} ${y0}A${R2} ${R2} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${R1} ${R1} 0 0 0 ${x3} ${y3}Z`;
    };
    const wedges = services.map((s, i) => {
      const g = sv('g', { class: 'wedge', role: 'button', tabindex: 0, 'aria-label': `Show ${s.long}`, transform: `rotate(${i * STEP})`, 'data-i': i }, gW);
      const body = sv('g', { class: 'wedge__body' }, g);
      sv('path', { class: 'wedge__shape', d: sector(-STEP / 2 + GAP, STEP / 2 - GAP), fill: s.theme.bg }, body);
      sv('path', { class: 'wedge__ring', d: sector(-STEP / 2 + GAP + 1.4, STEP / 2 - GAP - 1.4), fill: 'none', stroke: s.theme.ink, 'stroke-width': 3, 'stroke-dasharray': '8 6' }, body);
      const lab = sv('g', { class: 'wedge__label' }, body);
      const fs = Math.min(38, 182 / (s.name.length * .56));
      const t = sv('text', {
        'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs.toFixed(1), 'font-weight': 760,
        fill: s.theme.ink, style: `font-variation-settings:'wdth' 88; letter-spacing:-.02em`
      }, lab);
      t.textContent = s.name;
      const ic = sv('g', { class: 'wedge__icon', fill: 'none', stroke: s.theme.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: `color:${s.theme.ink}` }, body);
      ic.innerHTML = `<g transform="scale(1.35)">${ICONS[s.id]}</g>`;
      return { g, body, lab, ic };
    });

    // hub
    sv('circle', { r: R1 - 12, fill: 'var(--ink)' }, gHub);
    const ringText = sv('text', { 'font-size': 17, 'font-weight': 650, fill: 'var(--bg)', 'letter-spacing': 1.5, style: `font-variation-settings:'wdth' 90` }, gHub);
    const tp = sv('textPath', { href: '#hubRing', textLength: 1250, lengthAdjust: 'spacing' }, ringText);
    tp.textContent = 'Staffing / Permits / Event IT / Production / Media / Coordination / UAE, KSA and Qatar / ';
    sv('circle', { r: 176, fill: 'none', stroke: 'var(--bg)', 'stroke-opacity': .18, 'stroke-width': 4 }, gHub);
    const prog = sv('circle', { r: 176, fill: 'none', stroke: 'var(--bg)', 'stroke-width': 4, 'stroke-linecap': 'round', transform: 'rotate(-90)', 'stroke-dasharray': `${2 * Math.PI * 176}`, 'stroke-dashoffset': `${2 * Math.PI * 176}` }, gHub);
    const hubIn = sv('g', { class: 'hub__in' }, gHub);
    const logo = sv('g', { class: 'hub__logo' }, hubIn);
    logo.innerHTML = `<g transform="translate(-62 -54) scale(.24)">${LOGO}</g>`;
    const glyph = sv('g', { class: 'hub__glyph', fill: 'var(--bg)' }, hubIn);
    const glyphLabel = sv('text', { 'font-size': 15, 'font-weight': 600, fill: 'var(--bg)', 'text-anchor': 'middle', y: 64, opacity: .8 }, hubIn);

    // pointer notch (static)
    const ptr = sv('g', {}, gPtr);
    sv('path', { d: 'M500 0L530 -14V14Z', fill: 'var(--ink)' }, ptr);
    sv('line', { x1: 530, y1: 0, x2: 600, y2: 0, stroke: 'var(--ink)', 'stroke-width': 2.5 }, ptr);
    sv('circle', { cx: 604, cy: 0, r: 5, fill: 'var(--ink)' }, ptr);

    const ringRot = gsap.to({ a: 0 }, { a: -360, duration: 90, repeat: -1, ease: 'none', onUpdate() { ringText.setAttribute('transform', `rotate(${this.targets()[0].a})`); } });

    const layout = () => {
      wedges.forEach(w => {
        const mid = (R1 + R2) / 2 - 22;
        w.lab.setAttribute('transform', `translate(${mid} 0) rotate(${-P})`);
        w.ic.setAttribute('transform', `translate(${R2 - 30} 0) rotate(${-P})`);
      });
      ptr.setAttribute('transform', `rotate(${P})`);
      const off = 100;
      hubIn.setAttribute('transform', `translate(${Math.cos(rad(P)) * off} ${Math.sin(rad(P)) * off})`);
      render();
    };
    const render = () => {
      gW.setAttribute('transform', `rotate(${rot})`);
      gTicks.setAttribute('transform', `rotate(${rot})`);
    };
    const setGlyph = paused => {
      glyph.innerHTML = paused
        ? `<path d="M-7 -10L10 0L-7 10Z" transform="translate(0 62)"/>`
        : `<rect x="-8" y="52" width="5.5" height="20" rx="2"/><rect x="2.5" y="52" width="5.5" height="20" rx="2"/>`;
      glyphLabel.textContent = '';
    };
    setGlyph(false);

    const targetFor = (i, near = rot) => {
      const base = P - i * STEP;
      return base + Math.round((near - base) / 360) * 360;
    };
    const indexAt = r => (((Math.round((P - r) / STEP)) % N) + N) % N;

    const setActive = i => {
      active = i;
      wedges.forEach((w, k) => {
        w.g.setAttribute('aria-current', k === i ? 'true' : 'false');
        gsap.to(w.body, { x: k === i ? 22 : 0, duration: .7, ease: 'expo.out' });
      });
    };
    const rotateTo = (i, dur = 1.05) => {
      tween && tween.kill();
      const st = { r: rot };
      tween = gsap.to(st, { r: targetFor(i), duration: dur, ease: 'power3.inOut', onUpdate: () => { rot = st.r; render(); } });
    };
    const nudge = () => gsap.fromTo(ptr.firstChild, { attr: { d: 'M490 0L530 -16V16Z' } }, { attr: { d: 'M500 0L530 -14V14Z' }, duration: .35, ease: 'elastic.out(1,.4)' });

    // ---------- drag with inertia ----------
    let lastA = 0, lastT = 0, vel = 0, moved = 0, downTarget = null, lastIdx = 0;
    const angleOf = e => {
      const r = svg.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
    };
    svg.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; moved = 0; vel = 0;
      downTarget = e.target.closest('.wedge, .hub');
      lastA = angleOf(e); lastT = performance.now(); lastIdx = indexAt(rot);
      svg.setPointerCapture(e.pointerId);
      tween && tween.kill();
      cb.onGrab && cb.onGrab();
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const a = angleOf(e), now = performance.now();
      let d = a - lastA; if (d > 180) d -= 360; if (d < -180) d += 360;
      rot += d; moved += Math.abs(d);
      const dt = Math.max(1, now - lastT);
      vel = vel * .6 + (d / dt) * .4;
      lastA = a; lastT = now;
      render();
      const idx = indexAt(rot);
      if (idx !== lastIdx) { lastIdx = idx; nudge(); if (navigator.vibrate) navigator.vibrate(4); }
    });
    const release = e => {
      if (!dragging) return;
      dragging = false;
      if (moved < 3) {
        if (downTarget && downTarget.classList.contains('hub')) { cb.onHub(); return; }
        if (downTarget) { cb.onSelect(+downTarget.dataset.i, 'click'); return; }
        cb.onSelect(active, 'none');
        return;
      }
      const projected = rot + vel * 260;
      const i = indexAt(projected);
      const st = { r: rot };
      const tgt = targetFor(i, projected);
      tween = gsap.to(st, { r: tgt, duration: Math.min(1.4, .55 + Math.abs(tgt - rot) / 260), ease: 'power3.out', onUpdate: () => { rot = st.r; render(); } });
      cb.onSelect(i, 'drag');
    };
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);
    svg.addEventListener('keydown', e => {
      const w = e.target.closest('.wedge');
      if ((e.key === 'Enter' || e.key === ' ') && w) { e.preventDefault(); cb.onSelect(+w.dataset.i, 'key'); }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.hub')) { e.preventDefault(); cb.onHub(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); cb.onSelect((active + 1) % N, 'key'); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); cb.onSelect((active - 1 + N) % N, 'key-prev'); }
    });

    layout();
    setActive(0);

    return {
      rotateTo, setActive,
      progress(p) { prog.setAttribute('stroke-dashoffset', (1 - p) * 2 * Math.PI * 176); },
      setPaused: setGlyph,
      setPointer(p) { if (p !== P) { const i = active; P = p; rot = targetFor(i); layout(); } },
      origin() {
        const r = svg.getBoundingClientRect(), k = r.width / 1080;
        const rr = (R1 + R2) / 2 * k;
        return [r.left + r.width / 2 + Math.cos(rad(P)) * rr, r.top + r.height / 2 + Math.sin(rad(P)) * rr];
      },
      logoRect() { return logo.getBoundingClientRect(); },
      hubCircle() {
        const r = svg.getBoundingClientRect(), k = r.width / 1080;
        return [r.left + r.width / 2, r.top + r.height / 2, (R1 - 12) * k];
      },
      intro() {
        const st = { r: rot + 210 };
        rot = st.r; render();
        const tl = gsap.timeline();
        tl.to(st, { r: targetFor(active, rot - 210), duration: 1.5, ease: 'expo.out', onUpdate: () => { rot = st.r; render(); } }, 0)
          .from(wedges.map(w => w.g), { opacity: 0, scale: .55, svgOrigin: '0 0', duration: 1, stagger: .05, ease: 'expo.out' }, 0)
          .from(gTicks, { opacity: 0, duration: .8 }, .2)
          .from(gPtr, { opacity: 0, x: -30, duration: .6, ease: 'power3.out' }, .5);
        return tl;
      },
      kill() { ringRot.kill(); }
    };
  };
})();
