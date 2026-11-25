/* One bespoke motion graphic per service.
   Each factory takes a host element and returns { play(), pause() }.
   Timelines are created paused; only the visible visual runs. */
(() => {
  const XE = window.XE;
  const NS = 'http://www.w3.org/2000/svg';
  const IMG = 'assets/img/';
  let uid = 0;

  const h = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const sv = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const rand = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* frame loop that only runs while playing */
  const makeLoop = update => {
    let on = false, t = 0;
    const fn = (time, dms) => { const dt = Math.min(dms / 1000, .05); t += dt; update(t, dt); };
    return {
      play() { if (!on) { on = true; gsap.ticker.add(fn); } },
      pause() { on = false; gsap.ticker.remove(fn); },
      reset() { t = 0; }
    };
  };
  const group = (...parts) => ({
    play() { parts.forEach(p => p && p.play()); },
    pause() { parts.forEach(p => p && p.pause()); }
  });

  XE.visuals = {};

  /* =====================================================
     STAFFING — lanyard badges swing, flip to new roles,
     a greeting bubble cycles through languages
     ===================================================== */
  XE.visuals.staffing = host => {
    const root = h('div', 'vis v-staff');
    host.appendChild(root);
    const roles = [
      ['Hostess', 'Front of house', 'hostesses.jpg', 'EN AR'],
      ['Registration', 'Accreditation desk', 'registration.jpg', 'EN AR HI'],
      ['Promoter', 'Brand activation', 'promoters.jpg', 'EN AR FR'],
      ['Interpreter', 'Multilingual team', 'multilingual.jpg', 'AR EN RU'],
      ['Supervisor', 'Team lead on site', 'supervisors.jpg', 'EN AR UR']
    ];
    const fill = (card, r) => {
      card.querySelector('.badge__photo').style.backgroundImage = `url(${IMG + r[2]})`;
      card.querySelector('.badge__role').textContent = r[0];
      card.querySelector('.badge__sub').innerHTML = `<span>${r[1]}</span><span>${r[3]}</span>`;
    };
    const shown = [0, 1, 2];
    const badges = [0, 1, 2].map(k => {
      const b = h('div', `badge badge--${k}`, `
        <div class="badge__strap"></div><div class="badge__clip"></div>
        <div class="badge__card"><div class="badge__photo"></div>
          <div class="badge__meta"><b class="badge__role"></b><span class="badge__sub"></span></div>
          <div class="badge__bar"></div></div>`);
      root.appendChild(b);
      fill(b.querySelector('.badge__card'), roles[shown[k]]);
      return b;
    });
    const bubble = h('div', 'bubble', '<span class="bubble__in">Welcome</span>');
    root.appendChild(bubble);
    const bubbleIn = bubble.firstChild;

    const swings = badges.map((b, k) => gsap.fromTo(b,
      { rotation: [-3.2, -2, -3.6][k] },
      { rotation: [3.2, 2, 3.6][k], duration: [1.9, 2.3, 1.7][k], ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }));

    let next = 3, order = [1, 0, 2], oi = 0;
    const flip = () => {
      const k = order[oi++ % 3];
      const card = badges[k].querySelector('.badge__card');
      while (shown.includes(next % roles.length)) next++;
      const ri = next++ % roles.length;
      shown[k] = ri;
      gsap.timeline()
        .to(badges[k], { y: 10, duration: .18, ease: 'power2.in' })
        .to(card, { rotationY: 90, duration: .22, ease: 'power2.in' }, 0)
        .call(() => fill(card, roles[ri]))
        .fromTo(card, { rotationY: -90 }, { rotationY: 0, duration: .6, ease: 'back.out(1.7)' })
        .to(badges[k], { y: 0, duration: .7, ease: 'elastic.out(1, .4)' }, '<');
    };
    const flips = gsap.timeline({ repeat: -1, paused: true }).to({}, { duration: 1.9 }).call(flip);

    const hello = ['Welcome', 'أهلاً وسهلاً', 'Bienvenue', 'Willkommen', 'Добро пожаловать', '欢迎光临', 'स्वागत है', 'Benvenuti', 'Hoş geldiniz'];
    let hi = 0;
    const roll = () => {
      const w0 = bubble.getBoundingClientRect().width;
      gsap.timeline()
        .to(bubbleIn, { yPercent: -110, duration: .28, ease: 'power2.in' })
        .call(() => {
          bubbleIn.textContent = hello[++hi % hello.length];
          bubble.style.width = 'auto';
          const w1 = bubble.getBoundingClientRect().width;
          gsap.fromTo(bubble, { width: w0 }, { width: w1, duration: .45, ease: 'power3.out', clearProps: 'width' });
        })
        .fromTo(bubbleIn, { yPercent: 110 }, { yPercent: 0, duration: .5, ease: 'expo.out' });
    };
    const rolls = gsap.timeline({ repeat: -1, paused: true }).to({}, { duration: 1.35 }).call(roll);

    // badges lean toward the cursor
    const qx = badges.map(b => gsap.quickTo(b, 'x', { duration: .8, ease: 'power3.out' }));
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      qx.forEach((q, k) => q(nx * [18, 26, 14][k]));
    });
    root.addEventListener('pointerleave', () => qx.forEach(q => q(0)));

    return group(...swings, flips, rolls);
  };

  /* =====================================================
     PERMITS — application fills in, rubber stamp slams,
     document is filed, next venue
     ===================================================== */
  XE.visuals.permits = host => {
    const id = ++uid;
    const root = h('div', 'vis v-permit');
    host.appendChild(root);
    const cases = [
      { city: 'Dubai', ev: 'Arena concert', venue: 'Coca-Cola Arena', auth: 'DTCM', a: 'DTCM', stage: '38 performers', ref: 'XE-0418' },
      { city: 'Abu Dhabi', ev: 'International summit', venue: 'ADNEC', auth: 'DCT Abu Dhabi', a: 'DCT', stage: '212 speakers', ref: 'XE-0419' },
      { city: 'Dubai', ev: 'Trade exhibition', venue: 'Dubai World Trade Centre', auth: 'DWTC', a: 'DWTC', stage: '6 presenters', ref: 'XE-0420' },
      { city: 'Dubai', ev: 'Fitness festival', venue: 'Expo City Dubai', auth: 'Dubai Sports Council', a: 'DSC', stage: '14 coaches', ref: 'XE-0421' },
      { city: 'Abu Dhabi', ev: 'Live concert', venue: 'Etihad Arena', auth: 'DCT Abu Dhabi', a: 'DCT', stage: '24 performers', ref: 'XE-0422' }
    ];
    const rowsDef = [['Event', 'ev'], ['Venue', 'venue'], ['Authority', 'auth'], ['On stage', 'stage'], ['Safety plan', null]];
    root.innerHTML = `
      <div class="doc">
        <div class="doc__head"><span class="doc__title">Event permit</span><span class="doc__city">Dubai</span></div>
        <div class="doc__ref">Application XE-0418</div>
        <dl class="doc__rows">${rowsDef.map(([l]) => `
          <div class="doc__row"><dt>${l}</dt><dd>${l === 'Safety plan' ? 'Submitted' : ''}</dd>
          <svg class="doc__tick" viewBox="0 0 18 18"><path d="M3 9.5l4 4 8-9"/></svg></div>`).join('')}
        </dl>
        <div class="doc__sign"><span>Filed by the Xenial permits desk</span>
          <svg viewBox="0 0 160 50"><path d="M4 36C20 8 30 8 34 30S52 44 60 22 80 4 86 30s18 10 32-12 22 2 38 8"/></svg></div>
        <svg class="stamp-mark" viewBox="0 0 200 200">
          <defs>
            <filter id="grunge${id}" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${id * 7}" result="n"/>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.7" result="m"/>
              <feComposite in="SourceGraphic" in2="m" operator="in" result="c"/>
              <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" result="w"/>
              <feDisplacementMap in="c" in2="w" scale="5"/>
            </filter>
            <path id="arcT${id}" d="M28 100A72 72 0 0 1 172 100"/>
            <path id="arcB${id}" d="M36 100A64 64 0 0 0 164 100"/>
          </defs>
          <g filter="url(#grunge${id})">
            <circle cx="100" cy="100" r="92" fill="none" stroke="#D3263A" stroke-width="7"/>
            <circle cx="100" cy="100" r="79" fill="none" stroke="#D3263A" stroke-width="2.5"/>
            <text fill="#D3263A" font-size="15" font-weight="800" letter-spacing="3"><textPath href="#arcT${id}" startOffset="50%" text-anchor="middle">PERMITS DESK</textPath></text>
            <rect x="14" y="78" width="172" height="44" fill="#D3263A"/>
            <text x="100" y="111" text-anchor="middle" fill="#FFFDF7" font-size="31" font-weight="800" letter-spacing="2">CLEARED</text>
            <text class="stamp-city" fill="#D3263A" font-size="15" font-weight="800" letter-spacing="3"><textPath href="#arcB${id}" startOffset="50%" text-anchor="middle">DUBAI</textPath></text>
          </g>
        </svg>
      </div>
      <svg class="stamp-tool" viewBox="0 0 120 170">
        <ellipse cx="60" cy="26" rx="30" ry="24" fill="#13213F"/>
        <ellipse cx="52" cy="18" rx="12" ry="7" fill="#fff" opacity=".18"/>
        <rect x="49" y="44" width="22" height="48" rx="7" fill="#13213F"/>
        <path d="M24 92h72l9 34H15z" fill="#2B3C68"/>
        <rect x="10" y="126" width="100" height="18" rx="3" fill="#6B4E33"/>
        <rect x="12" y="144" width="96" height="10" rx="2" fill="#D3263A"/>
      </svg>
      <div class="authorities"><span>DTCM</span><span>DCT</span><span>DSC</span><span>DWTC</span></div>`;

    const doc = root.querySelector('.doc');
    const dds = [...root.querySelectorAll('.doc__row dd')];
    const ticks = root.querySelectorAll('.doc__tick path');
    const sign = root.querySelector('.doc__sign path');
    const mark = root.querySelector('.stamp-mark');
    const tool = root.querySelector('.stamp-tool');
    const city = root.querySelector('.doc__city');
    const ref = root.querySelector('.doc__ref');
    const stampCity = root.querySelector('.stamp-city textPath');
    const auths = [...root.querySelectorAll('.authorities span')];
    const signLen = 260;
    gsap.set(sign, { strokeDasharray: signLen, strokeDashoffset: signLen });
    let ci = -1;

    const setCase = () => {
      const c = cases[ci = (ci + 1) % cases.length];
      city.textContent = c.city;
      ref.textContent = 'Application ' + c.ref;
      stampCity.textContent = c.city.toUpperCase();
      rowsDef.forEach(([, key], k) => { if (key) dds[k].textContent = c[key]; });
      auths.forEach(a => a.classList.toggle('is-on', a.textContent === c.a));
      gsap.set(dds, { clipPath: 'inset(0 100% 0 0)' });
      gsap.set(ticks, { strokeDashoffset: 22 });
      gsap.set(sign, { strokeDashoffset: signLen });
      gsap.set(mark, { opacity: 0, scale: 1 });
      gsap.set(tool, { opacity: 0 });
    };
    const placeTool = () => {
      const r = root.getBoundingClientRect(), m = mark.getBoundingClientRect();
      const w = r.width * .3, hgt = w * 170 / 120;
      tool.style.width = w + 'px';
      tool.style.left = (m.left - r.left + m.width / 2 - w / 2) + 'px';
      tool.style.top = (m.top - r.top + m.height / 2 - hgt * 150 / 170) + 'px';
    };
    const impact = () => {
      const r = root.getBoundingClientRect(), m = mark.getBoundingClientRect();
      const cx = m.left - r.left + m.width / 2, cy = m.top - r.top + m.height / 2;
      for (let k = 0; k < 12; k++) {
        const d = h('i', 'dust');
        root.appendChild(d);
        const a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 70;
        gsap.fromTo(d, { x: cx, y: cy, opacity: 1, scale: 1 + Math.random() },
          { x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist * .7, opacity: 0, scale: .3, duration: .6 + Math.random() * .3, ease: 'power3.out', onComplete: () => d.remove() });
      }
    };

    const tl = gsap.timeline({ repeat: -1, paused: true });
    tl.call(setCase)
      .fromTo(doc, { xPercent: 130, rotation: 9 }, { xPercent: 0, rotation: -2.5, duration: .75, ease: 'power3.out' })
      .to(dds, { clipPath: 'inset(0 0% 0 0)', duration: .32, stagger: .2, ease: 'power2.out' }, '-=.15')
      .to(ticks, { strokeDashoffset: 0, duration: .25, stagger: .2, ease: 'power1.out' }, '<.12')
      .to(sign, { strokeDashoffset: 0, duration: .55, ease: 'power1.inOut' }, '-=.05')
      .call(placeTool)
      .fromTo(tool, { y: -240, opacity: 1, scale: 1.2, rotation: -8 }, { y: 0, scale: 1, rotation: -3, duration: .4, ease: 'power4.in' })
      .call(impact)
      .set(mark, { opacity: .92, scale: 1.22 })
      .to(mark, { scale: 1, duration: .2, ease: 'power2.out' })
      .to(doc, { y: 7, duration: .07, yoyo: true, repeat: 1, ease: 'power1.out' }, '<')
      .to(tool, { y: -280, rotation: 6, opacity: 0, duration: .6, ease: 'power2.out' }, '+=.12')
      .to({}, { duration: 1 })
      .to(doc, { xPercent: -150, rotation: -14, duration: .55, ease: 'power3.in' });
    return tl;
  };

  /* =====================================================
     EVENT IT — badge prints, QR is scanned, attendee
     checked in, registrations counter ticks
     ===================================================== */
  XE.visuals.it = host => {
    const id = ++uid;
    const root = h('div', 'vis v-it');
    host.appendChild(root);
    const svg = sv('svg', { viewBox: '0 0 440 460', preserveAspectRatio: 'xMidYMid meet' }, root);
    const defs = sv('defs', {}, svg);
    defs.innerHTML = `
      <clipPath id="slot${id}"><rect x="0" y="106" width="440" height="354"/></clipPath>
      <filter id="glow${id}" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>
      <linearGradient id="beam${id}" x1="0" x2="1"><stop offset="0" stop-color="#8EF0FF" stop-opacity="0"/><stop offset=".5" stop-color="#8EF0FF"/><stop offset="1" stop-color="#8EF0FF" stop-opacity="0"/></linearGradient>`;

    // network backdrop
    const net = sv('g', { opacity: .55 }, svg);
    const nodes = [];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) nodes.push([30 + c * 63.3, 40 + r * 66]);
    const edges = [];
    const rn = rand(id * 13);
    nodes.forEach((p, k) => {
      const c = k % 7;
      if (c < 6 && rn() > .35) edges.push([p, nodes[k + 1]]);
      if (k + 7 < nodes.length && rn() > .45) edges.push([p, nodes[k + 7]]);
    });
    edges.forEach(([a, b]) => sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'rgba(242,245,255,.16)', 'stroke-width': 1 }, net));
    nodes.forEach(p => sv('circle', { cx: p[0], cy: p[1], r: 2, fill: 'rgba(242,245,255,.35)' }, net));
    const pulses = Array.from({ length: 7 }, () => ({ el: sv('circle', { r: 3, fill: '#8EF0FF', filter: `url(#glow${id})` }, net), e: null, p: Math.random(), s: .7 + Math.random() * .8 }));
    pulses.forEach(pl => { pl.e = edges[Math.floor(Math.random() * edges.length)]; sv('circle', { r: 1.6, fill: '#fff' }, net); });

    // printer
    const printer = sv('g', {}, svg);
    printer.innerHTML = `
      <rect x="104" y="18" width="232" height="98" rx="20" fill="#F2F5FF"/>
      <rect x="104" y="86" width="232" height="30" rx="0" fill="#D9E0FA"/>
      <rect x="104" y="96" width="232" height="20" rx="10" fill="#D9E0FA"/>
      <rect x="132" y="104" width="176" height="6" rx="3" fill="#0B1A5C"/>
      <text x="128" y="52" font-size="15" font-weight="750" fill="#0B1A5C">Badge printer 2</text>
      <text class="it-status" x="128" y="72" font-size="12.5" fill="#4A5A93">Ready</text>`;
    const led = sv('circle', { cx: 308, cy: 50, r: 6, fill: '#36D399' }, printer);
    const status = printer.querySelector('.it-status');

    // badge (clipped so it emerges from the slot)
    const clip = sv('g', { 'clip-path': `url(#slot${id})` }, svg);
    const badge = sv('g', {}, clip);
    sv('rect', { x: 135, y: 120, width: 170, height: 246, rx: 12, fill: '#FFFFFF' }, badge);
    const band = sv('rect', { x: 135, y: 120, width: 170, height: 40, rx: 12, fill: '#8EF0FF' }, badge);
    sv('rect', { x: 135, y: 146, width: 170, height: 14, fill: 'inherit' }, badge).setAttribute('class', 'band2');
    const band2 = badge.querySelector('.band2');
    const bType = sv('text', { x: 150, y: 146, 'font-size': 14, 'font-weight': 800, fill: '#0B1A5C' }, badge);
    const bName = sv('text', { x: 150, y: 186, 'font-size': 17, 'font-weight': 750, fill: '#0B1A5C' }, badge);
    const bOrg = sv('text', { x: 150, y: 204, 'font-size': 11.5, fill: '#56628F' }, badge);
    const qr = sv('path', { fill: '#0B1A5C', transform: 'translate(171.5 216)' }, badge);
    sv('text', { x: 150, y: 352, 'font-size': 10.5, fill: '#56628F' }, badge).textContent = 'Day 2, Hall 4';

    // scanner beam + check
    const beam = sv('g', { opacity: 0 }, svg);
    sv('rect', { x: 140, y: -3, width: 160, height: 6, fill: `url(#beam${id})`, filter: `url(#glow${id})` }, beam);
    sv('rect', { x: 150, y: -1, width: 140, height: 2, fill: '#E9FDFF' }, beam);
    const check = sv('g', { transform: 'translate(220 264)' }, svg);
    sv('circle', { r: 30, fill: '#36D399' }, check);
    sv('path', { d: 'M-12 1l8 8 16-18', fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
    gsap.set(check, { scale: 0, svgOrigin: '220 264', opacity: 0 });

    // counter
    const counter = sv('g', {}, svg);
    const cNum = sv('text', { x: 220, y: 418, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: '#F2F5FF', style: 'font-variant-numeric: tabular-nums; letter-spacing:-.02em' }, counter);
    sv('text', { x: 220, y: 442, 'text-anchor': 'middle', 'font-size': 13, fill: 'rgba(242,245,255,.72)' }, counter).textContent = 'attendee registrations on our systems';
    let count = 250318;
    cNum.textContent = count.toLocaleString('en-US');

    const people = [
      ['Layla Haddad', 'Visitor', 'Al Noor Logistics', '#8EF0FF'],
      ['Omar Rahman', 'Exhibitor', 'Gulf Foods Trading', '#F26F22'],
      ['Chen Wei', 'Speaker', 'Smart Grid Asia', '#FFC21A'],
      ['Sara Okafor', 'Media', 'Business Daily', '#FF7AA2'],
      ['Arjun Mehta', 'VIP', 'Delegation', '#E9E2CC'],
      ['Elena Silva', 'Visitor', 'Lisbon Rail', '#8EF0FF']
    ];
    const qrD = seed => {
      const n = 21, m = 4.6, rr = rand(seed);
      let d = '';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const fr = r < 7 ? r : r >= n - 7 ? r - (n - 7) : -1;
        const fc = c < 7 ? c : c >= n - 7 ? c - (n - 7) : -1;
        const inF = fr >= 0 && fc >= 0 && !(r >= n - 7 && c >= n - 7);
        const nearF = (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
        let on;
        if (inF) on = fr === 0 || fr === 6 || fc === 0 || fc === 6 || (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4);
        else if (nearF) on = false;
        else on = rr() > .52;
        if (on) d += `M${(c * m).toFixed(1)} ${(r * m).toFixed(1)}h${m}v${m}h-${m}z`;
      }
      return d;
    };
    let pi = 0;
    const setBadge = () => {
      const p = people[pi++ % people.length];
      bName.textContent = p[0]; bType.textContent = p[1]; bOrg.textContent = p[2];
      band.setAttribute('fill', p[3]); band2.setAttribute('fill', p[3]);
      qr.setAttribute('d', qrD(pi * 31 + id));
      status.textContent = 'Printing badge ' + (411 + pi);
      gsap.set(badge, { x: 0, y: -250, rotation: 0, svgOrigin: '220 240' });
      gsap.set(check, { scale: 0, opacity: 0 });
    };

    const tl = gsap.timeline({ repeat: -1, paused: true });
    tl.call(setBadge)
      .to(led, { attr: { fill: '#FFC21A' }, duration: .1 })
      .to(badge, { y: 0, duration: 1.15, ease: 'steps(18)' })
      .to(led, { attr: { fill: '#36D399' }, duration: .1 })
      .call(() => { status.textContent = 'Scanning'; })
      .fromTo(beam, { opacity: 0, y: 210 }, { opacity: 1, y: 212, duration: .12 })
      .to(beam, { y: 318, duration: .55, ease: 'sine.inOut' })
      .to(beam, { y: 214, duration: .4, ease: 'sine.inOut' })
      .to(beam, { opacity: 0, duration: .12 })
      .to(check, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2.2)' }, '-=.05')
      .call(() => {
        status.textContent = 'Checked in';
        count += 1;
        cNum.textContent = count.toLocaleString('en-US');
        gsap.fromTo(cNum, { attr: { y: 410 }, opacity: .4 }, { attr: { y: 418 }, opacity: 1, duration: .45, ease: 'expo.out' });
      }, null, '<')
      .to({}, { duration: .7 })
      .to(badge, { x: 300, rotation: 10, duration: .5, ease: 'power3.in' })
      .to(check, { scale: .6, opacity: 0, duration: .3 }, '<');

    const loop = makeLoop((t, dt) => {
      pulses.forEach(pl => {
        pl.p += dt * pl.s;
        if (pl.p >= 1) { pl.p = 0; pl.e = edges[Math.floor(Math.random() * edges.length)]; }
        const [a, b] = pl.e;
        pl.el.setAttribute('cx', a[0] + (b[0] - a[0]) * pl.p);
        pl.el.setAttribute('cy', a[1] + (b[1] - a[1]) * pl.p);
      });
    });
    return group(tl, loop);
  };

  /* =====================================================
     PRODUCTION — exhibition stand in live 3D:
     wireframe render → fabricated panels → branded build
     ===================================================== */
  XE.visuals.production = host => {
    const root = h('div', 'vis v-prod', `<canvas></canvas>
      <div class="dims">6 m by 4 m stand</div>
      <div class="phases"><span>Render</span><span>Fabricate</span><span>Build</span></div>`);
    host.appendChild(root);
    const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
    const pills = [...root.querySelectorAll('.phases span')];
    const dims = root.querySelector('.dims');
    const INK = '#17130A';

    // [x0,y0,z0,x1,y1,z1, base, brand]
    const B = [
      [-300, 0, -200, 300, 14, 200, '#D9BA8C', '#3A3836'],          // platform
      [-300, 14, 180, 300, 250, 200, '#F6F3EC', '#F6F3EC'],         // back wall
      [-300, 14, -60, -282, 250, 180, '#F6F3EC', '#1FB2AA'],        // left wall
      [170, 14, 90, 300, 330, 180, '#F2EEE6', '#F26F22'],           // tower
      [-20, 14, -170, 160, 106, -100, '#F6F3EC', '#FFFFFF'],        // counter
      [-30, 106, -178, 170, 114, -92, '#E9E4DA', '#17130A'],        // counter top
      [-210, 110, 172, 30, 214, 180, '#E2DED6', '#1F3FD6'],         // screen
      [-250, 14, -40, -186, 92, 24, '#F6F3EC', '#FFFFFF'],          // plinth
      [-236, 92, -26, -200, 124, 10, '#E9E4DA', '#F26F22']          // product
    ];
    const FACES = [ // corner index sets + normal
      [[0, 1, 5, 4], [0, -1, 0]], [[3, 2, 6, 7], [0, 1, 0]],
      [[0, 1, 2, 3], [0, 0, -1]], [[4, 5, 6, 7], [0, 0, 1]],
      [[0, 3, 7, 4], [-1, 0, 0]], [[1, 2, 6, 5], [1, 0, 0]]
    ];
    const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const corners = b => {
      const [x0, y0, z0, x1, y1, z1] = b;
      return [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    };
    const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const L = (() => { const v = [-.45, .8, -.55], l = Math.hypot(...v); return v.map(x => x / l); })();

    let drag = 0, dragging = false, lastX = 0, W = 0, H = 0, dpr = 1, phase = -1;
    cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (dragging) { drag += (e.clientX - lastX) * .01; lastX = e.clientX; } });
    cv.addEventListener('pointerup', () => { dragging = false; });

    const T = 10.5;
    const draw = t => {
      const rect = root.getBoundingClientRect();
      const w = rect.width, hh = rect.height - 40;
      if (w < 10 || hh < 10) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w !== W || hh !== H) { W = w; H = hh; cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const tt = t % T;
      const ph = tt < 3.4 ? 0 : tt < 6.8 ? 1 : 2;
      if (ph !== phase) { phase = ph; pills.forEach((p, k) => p.classList.toggle('is-on', k === ph)); }
      const wire = ph === 0 ? clamp(tt / 2.8) : 1;
      const fillA = ph === 0 ? 0 : ph === 1 ? ease(clamp((tt - 3.4) / .9)) : 1;
      const brandA = ph === 2 ? ease(clamp((tt - 6.8) / .9)) : 0;
      const fadeOut = tt > T - .5 ? 1 - (tt - (T - .5)) / .5 : 1;
      dims.style.opacity = ph === 0 ? 1 : .35;

      const yaw = -.62 + Math.sin(t * .32) * .3 + drag, pitch = .52;
      const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(W, H * 1.25) / 820, D = 1500;
      const ox = W / 2, oy = H * .56;
      const P = ([x, y, z]) => {
        y -= 130;
        const x1 = x * cy_ - z * sy_, z1 = x * sy_ + z * cy_;
        const y2 = y * cp + z1 * sp, z2 = -y * sp + z1 * cp;
        const k = D / (D + z2);
        return [ox + x1 * k * scale, oy - y2 * k * scale, z2];
      };
      const rotN = ([x, y, z]) => {
        const x1 = x * cy_ - z * sy_, z1 = x * sy_ + z * cy_;
        return [x1, y * cp + z1 * sp, -y * sp + z1 * cp];
      };

      ctx.globalAlpha = fadeOut;
      // floor grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(23,19,10,${.16 * (1 - brandA)})`;
      ctx.beginPath();
      for (let g = -400; g <= 400; g += 50) {
        let a = P([g, 0, -300]), b = P([g, 0, 300]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        a = P([-400, 0, g * .75]); b = P([400, 0, g * .75]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();

      // spotlights (build phase), drawn under geometry
      if (brandA > 0) {
        [[-150, 250, 190, -120, 0, -60], [60, 250, 190, 70, 0, -130]].forEach(([lx, ly, lz, tx, ty, tz]) => {
          const a = P([lx, ly, lz]), b1 = P([tx - 90, ty, tz]), b2 = P([tx + 90, ty, tz]);
          const g = ctx.createLinearGradient(a[0], a[1], (b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2);
          g.addColorStop(0, `rgba(255,252,235,${.55 * brandA})`); g.addColorStop(1, 'rgba(255,252,235,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.closePath(); ctx.fill();
        });
      }

      if (ph === 0) {
        // wireframe draw-in, box by box
        ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        B.forEach((b, k) => {
          const pk = clamp(wire * (B.length + 2) - k, 0, 1.6) / 1.6;
          if (pk <= 0) return;
          const c = corners(b).map(P);
          ctx.beginPath();
          EDGES.forEach(([i, j]) => {
            const a = c[i], e = c[j];
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(a[0] + (e[0] - a[0]) * ease(pk), a[1] + (e[1] - a[1]) * ease(pk));
          });
          ctx.stroke();
        });
        // dimension lines
        const d0 = P([-300, 0, -235]), d1 = P([300, 0, -235]), e0 = P([335, 0, -200]), e1 = P([335, 0, 200]);
        ctx.globalAlpha = fadeOut * clamp(wire * 2 - 1);
        ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(d0[0], d0[1]); ctx.lineTo(d1[0], d1[1]); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = INK; ctx.font = '700 13px "Bricolage Grotesque", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('6 m', (d0[0] + d1[0]) / 2, (d0[1] + d1[1]) / 2 + 18);
        ctx.fillText('4 m', (e0[0] + e1[0]) / 2 + 18, (e0[1] + e1[1]) / 2 + 4);
        ctx.globalAlpha = fadeOut;
      } else {
        // solid faces, painter's algorithm
        const faces = [];
        B.forEach((b, bi) => {
          const c = corners(b), pc = c.map(P);
          FACES.forEach(([idx, n]) => {
            const rn = rotN(n);
            if (rn[2] > 0.02) return;           // facing away
            const depth = idx.reduce((s, i) => s + pc[i][2], 0) / 4;
            const lam = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
            faces.push({ pts: idx.map(i => pc[i]), depth, lam, bi });
          });
        });
        faces.sort((a, b) => b.depth - a.depth);
        faces.forEach(f => {
          const b = B[f.bi];
          let col = mix(hex(b[6]), hex(b[7]), brandA);
          const shade = .62 + .38 * f.lam;
          col = col.map(v => Math.round(v * shade));
          ctx.beginPath();
          f.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.closePath();
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${fillA})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(23,19,10,${.9 - .55 * fillA})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });
        // brand details in build phase
        if (brandA > 0) {
          // screen glow
          const s0 = P([-200, 120, 171]), s1 = P([20, 204, 171]);
          ctx.globalAlpha = fadeOut * brandA;
          const g = ctx.createLinearGradient(s0[0], s0[1], s1[0], s1[1]);
          g.addColorStop(0, '#8EF0FF'); g.addColorStop(1, '#1F3FD6');
          ctx.fillStyle = g;
          const q = [[-200, 120, 171], [20, 120, 171], [20, 204, 171], [-200, 204, 171]].map(P);
          ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
          // logo on tower
          const lp = P([235, 255, 89]);
          ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(26 * scale * 1.6)}px "Bricolage Grotesque", sans-serif`; ctx.textAlign = 'center';
          ctx.fillText('XE', lp[0], lp[1]);
          // back wall band
          const band = [[-280, 222, 179], [168, 222, 179], [168, 240, 179], [-280, 240, 179]].map(P);
          ctx.fillStyle = '#F26F22';
          ctx.beginPath(); band.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = fadeOut;
        }
      }
      ctx.globalAlpha = 1;
    };
    const loop = makeLoop(t => draw(t));
    draw(.01);
    return loop;
  };

  /* =====================================================
     MEDIA — viewfinder: focus hunts, REC timecode runs,
     shutter fires, next frame; film strip below
     ===================================================== */
  XE.visuals.media = host => {
    const photos = ['gulfood.jpg', 'iucn.jpg', 'expand-north-star.jpg', 'wetex.jpg', 'saudi-international-rail.jpg', 'coordination-team.jpg'];
    const root = h('div', 'vis v-media', `
      <div class="vf">
        ${photos.map(p => `<div class="vf__photo" style="background-image:url(${IMG + p})"></div>`).join('')}
        <svg class="vf__overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g stroke="rgba(255,255,255,.28)" stroke-width="1" vector-effect="non-scaling-stroke" fill="none">
            <path d="M33.3 0V100M66.6 0V100M0 33.3H100M0 66.6H100" vector-effect="non-scaling-stroke"/>
          </g>
          <g stroke="#fff" stroke-width="2" fill="none" vector-effect="non-scaling-stroke">
            <path d="M4 12V4H12M88 4H96V12M96 88V96H88M12 96H4V88" vector-effect="non-scaling-stroke"/>
          </g>
          <g class="vf__focus" fill="none" stroke="#fff" stroke-width="2">
            <path d="M-9 -5V-9H-5M5 -9H9V-5M9 5V9H5M-5 9H-9V5" vector-effect="non-scaling-stroke"/>
          </g>
        </svg>
        <div class="vf__hud vf__hud--top"><span class="vf__rec"><i></i>REC</span><span class="vf__tc">00:00:00:00</span><span>4K 25p</span></div>
        <div class="vf__hud vf__hud--bot"><canvas class="vf__hist" width="148" height="60"></canvas><span>ISO 800  1/125  f2.8</span><span class="vf__af">AF</span></div>
        <div class="vf__shutter vf__shutter--t"></div><div class="vf__shutter vf__shutter--b"></div>
        <div class="vf__flash"></div>
      </div>
      <div class="film"><div class="film__track">${[...photos, ...photos].map(p => `<i style="background-image:url(${IMG + p})"></i>`).join('')}</div></div>`);
    host.appendChild(root);
    const els = [...root.querySelectorAll('.vf__photo')];
    const focus = root.querySelector('.vf__focus');
    const tc = root.querySelector('.vf__tc');
    const recDot = root.querySelector('.vf__rec i');
    const af = root.querySelector('.vf__af');
    const sh = root.querySelectorAll('.vf__shutter');
    const flash = root.querySelector('.vf__flash');
    const hist = root.querySelector('.vf__hist'), hx = hist.getContext('2d');
    let pi = 0, kb;
    els[0].classList.add('is-on');

    const spots = [[38, 40], [60, 36], [48, 55], [30, 48], [64, 52], [50, 42]];
    const show = k => {
      els.forEach((e, i) => e.classList.toggle('is-on', i === k));
      kb && kb.kill();
      kb = gsap.fromTo(els[k], { scale: 1.04 }, { scale: 1.14, duration: 3.6, ease: 'none' });
      const [fx, fy] = spots[k % spots.length];
      gsap.set(focus, { attr: { transform: `translate(${fx} ${fy}) scale(1.6 2.2)` }, opacity: 0, stroke: '#fff' });
      af.style.color = '#fff';
    };
    const tl = gsap.timeline({ repeat: -1, paused: true });
    tl.call(() => show(pi))
      .to(focus, { opacity: 1, duration: .1 }, .25)
      .to(focus, { attr: { transform: () => { const [fx, fy] = spots[pi % spots.length]; return `translate(${fx + 2} ${fy + 1}) scale(1.05 1.45)`; } }, duration: .35, ease: 'power3.out' }, .3)
      .to(focus, { attr: { transform: () => { const [fx, fy] = spots[pi % spots.length]; return `translate(${fx} ${fy}) scale(1.25 1.7)`; } }, duration: .2, ease: 'power2.inOut' })
      .to(focus, { attr: { transform: () => { const [fx, fy] = spots[pi % spots.length]; return `translate(${fx} ${fy}) scale(1.1 1.55)`; } }, duration: .25, ease: 'back.out(3)' })
      .call(() => { focus.setAttribute('stroke', '#36D399'); af.style.color = '#36D399'; })
      .to(focus, { opacity: .3, duration: .08, yoyo: true, repeat: 3 })
      .to({}, { duration: 1.5 })
      .to(sh, { scaleY: 1, duration: .09, ease: 'power2.in' })
      .set(flash, { opacity: .55 })
      .call(() => { pi = (pi + 1) % els.length; })
      .to(flash, { opacity: 0, duration: .3 })
      .to(sh, { scaleY: 0, duration: .16, ease: 'power2.out' }, '<');

    const bars = Array.from({ length: 37 }, () => Math.random());
    let acc = 0;
    const loop = makeLoop((t, dt) => {
      const f = Math.floor(t * 25), s = Math.floor(t), m = Math.floor(s / 60);
      tc.textContent = `00:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f % 25).padStart(2, '0')}`;
      recDot.style.opacity = (Math.floor(t * 1.6) % 2) ? .25 : 1;
      acc += dt;
      if (acc > .09) {
        acc = 0;
        for (let i = 0; i < bars.length; i++) {
          const base = Math.exp(-Math.pow((i - 15) / 9, 2)) * .8 + Math.exp(-Math.pow((i - 30) / 4, 2)) * .45;
          bars[i] += ((base + Math.random() * .25) - bars[i]) * .5;
        }
        hx.clearRect(0, 0, 148, 60);
        hx.fillStyle = 'rgba(255,255,255,.78)';
        bars.forEach((v, i) => hx.fillRect(i * 4, 60 - v * 56, 3, v * 56));
      }
    });
    return group(tl, loop, { play() { kb && kb.play(); }, pause() { kb && kb.pause(); } });
  };

  /* =====================================================
     COORDINATION — show-day run sheet with a live "now",
     radio check-ins popping in from the floor
     ===================================================== */
  XE.visuals.coordination = host => {
    const items = [
      [405, 'Venue walk-through'], [450, 'Crew briefing, Hall 4'], [495, 'Registration desks live'],
      [540, 'Doors open'], [630, 'VIP arrival, Gate A'], [720, 'Keynote, main stage'],
      [930, 'Media interviews'], [1080, 'Breakdown starts']
    ];
    const pings = [
      [500, 'DL', 'Desk lead, channel 2', 'Desk 3 printer swapped. Queue moving.'],
      [541, 'GA', 'Gate A, channel 1', 'Doors open on time.'],
      [624, 'PR', 'Protocol, channel 4', 'VIP convoy two minutes out.'],
      [712, 'SM', 'Stage manager, channel 3', 'Keynote mics checked. Ready.'],
      [925, 'MD', 'Media, channel 5', 'Interview room set.'],
      [1074, 'OP', 'Ops lead, channel 1', 'Breakdown crew on standby.']
    ];
    const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
    const root = h('div', 'vis v-coord', `
      <div class="sheet">
        <div class="sheet__head"><b>Run sheet, day 2</b><span class="sheet__clock">06:30</span></div>
        <ol class="sheet__list">${items.map(([m, t]) => `<li><time>${fmt(m)}</time><span class="t">${t}</span><span class="ok"><svg viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3"/></svg></span></li>`).join('')}</ol>
      </div>
      <div class="pings"></div>`);
    host.appendChild(root);
    const lis = [...root.querySelectorAll('.sheet__list li')];
    const clock = root.querySelector('.sheet__clock');
    const pingBox = root.querySelector('.pings');
    let live = [], fired = 0, lastNow = -2;
    const START = 390, END = 1110, SPEED = 62; // minutes per second

    const addPing = p => {
      const el = h('div', 'ping', `<span class="ping__av">${p[1]}</span><span><span class="ping__ch">${p[2]}</span><b>${p[3]}</b></span>`);
      pingBox.appendChild(el);
      live.unshift(el);
      const H = pingBox.getBoundingClientRect().height;
      live.forEach((e, i) => {
        const hgt = e.getBoundingClientRect().height;
        const y = H * .5 - i * (hgt + 12);
        if (i === 0) gsap.fromTo(e, { y: y + 40, x: 30, opacity: 0, scale: .9 }, { y, x: 0, opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.6)' });
        else gsap.to(e, { y, opacity: i > 1 ? 0 : .55, scale: .94, transformOrigin: '100% 50%', duration: .5, ease: 'power3.out' });
      });
      if (live.length > 3) { const old = live.pop(); gsap.to(old, { opacity: 0, duration: .2, onComplete: () => old.remove() }); }
    };
    const reset = () => {
      fired = 0; lastNow = -2;
      live.forEach(e => e.remove()); live = [];
      lis.forEach(li => li.classList.remove('is-done', 'is-now'));
    };
    let t0 = 0;
    const loop = makeLoop(t => {
      let m = START + (t - t0) * SPEED;
      if (m > END + 90) { t0 = t; reset(); m = START; }
      const mm = Math.min(m, END);
      clock.textContent = fmt(mm);
      let now = -1;
      items.forEach(([im], i) => { if (mm >= im) now = i; });
      if (now !== lastNow) {
        lastNow = now;
        lis.forEach((li, i) => { li.classList.toggle('is-done', i < now); li.classList.toggle('is-now', i === now); });
        if (lis[now]) gsap.fromTo(lis[now], { x: -6 }, { x: 0, duration: .5, ease: 'back.out(3)' });
      }
      while (fired < pings.length && mm >= pings[fired][0]) addPing(pings[fired++]);
    });
    return loop;
  };
})();
