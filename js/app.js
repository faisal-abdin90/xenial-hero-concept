/* Orchestration: intro, colour flood, kinetic type, autoplay, routing, cursor. */
(() => {
  const XE = window.XE, S = XE.services, N = S.length;
  const root = document.documentElement, body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mqMobile = matchMedia('(max-width: 860px)');
  const INTERVAL = 7; // seconds per service
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const CTA = {
    staffing: 'Explore event staffing', permits: 'Explore event permits', it: 'Explore event IT',
    production: 'Explore production', media: 'Explore media services', coordination: 'Explore event coordinators'
  };

  const els = {
    home: $('#home'), page: $('#page'), hero: $('.hero'), content: $('.hero__content'),
    word: $('.hero .bigword'), wordIn: $('.hero .bigword__inner'), srName: $('.hero .sr-name'),
    desc: $('.hero__desc-in'), cta: $('[data-cta]'), ctaLabel: $('[data-cta] .btn__label'),
    stats: $('.hero .stats'), stage: $('.hero .stage'), count: $('.ctrl__n'),
    flood: $('.flood'), wipe: $('.wipe'), ripples: $('.ripples'), intro: $('.intro'),
    statement: $('.hero__statement'), ctrl: $('.hero__ctrl'), marquee: $('.hero__marquee .marquee__track')
  };
  const live = document.createElement('p');
  live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
  Object.assign(live.style, { position: 'fixed', top: '0', left: '0' });
  body.appendChild(live);

  let current = 0, userPaused = reduce, hoverPause = false, heroVisible = true, onHome = true;
  let timer = null, wheel = null, floodTl = null, pageVis = null, pageIndex = 0;
  let lastClick = [innerWidth / 2, innerHeight / 2];

  /* ---------------- theme + flood ---------------- */
  const setTheme = t => {
    root.style.setProperty('--bg', t.bg);
    root.style.setProperty('--ink', t.ink);
    root.style.setProperty('--accent', t.accent);
  };
  const ripple = (x, y, color) => {
    for (let k = 0; k < 2; k++) {
      const d = document.createElement('i');
      d.className = 'ripple';
      Object.assign(d.style, { left: x + 'px', top: y + 'px', borderColor: color });
      els.ripples.appendChild(d);
      gsap.fromTo(d, { scale: 0, opacity: .9 }, { scale: 30 + k * 16, opacity: 0, duration: 1.3 + k * .3, delay: k * .14, ease: 'expo.out', onComplete: () => d.remove() });
    }
  };
  const flood = (theme, [x, y]) => {
    if (floodTl) floodTl.progress(1).kill();
    if (reduce) { setTheme(theme); return; }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 60;
    els.flood.style.background = theme.bg;
    ripple(x, y, theme.bg);
    floodTl = gsap.timeline({ onComplete: () => { floodTl = null; } })
      .fromTo(els.flood, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: 1.15, ease: 'expo.inOut' }, .1)
      .to(root, { '--ink': theme.ink, '--accent': theme.accent, duration: .55, ease: 'power2.inOut' }, .5)
      .call(() => { root.style.setProperty('--bg', theme.bg); gsap.set(els.flood, { clipPath: 'circle(0px at 0px 0px)' }); });
  };

  /* ---------------- kinetic big word ---------------- */
  const measure = document.createElement('span');
  measure.className = 'bigword';
  Object.assign(measure.style, { position: 'absolute', left: '-9999px', top: '0', visibility: 'hidden', fontSize: '100px', display: 'inline-block', height: 'auto', fontVariationSettings: '"wdth" 100, "opsz" 96' });
  body.appendChild(measure);
  const fitSize = (text, maxW, maxFs) => {
    measure.textContent = text;
    const w = measure.getBoundingClientRect().width || 1;
    return Math.max(32, Math.min(maxFs, Math.floor(100 * maxW / w * .96)));
  };
  const split = (el, text) => {
    el.textContent = '';
    return [...text].map(c => {
      const s = document.createElement('span');
      s.className = c === ' ' ? 'ch ch--sp' : 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
      return s;
    });
  };
  const heroBox = () => {
    const cs = getComputedStyle(els.content);
    const maxW = els.content.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const maxFs = mqMobile.matches ? innerWidth * .2 : Math.min(innerHeight * .2, 210);
    return { maxW, maxFs };
  };
  const showWord = (h1, inner, text, { dir = 1, maxW, maxFs, instant = false } = {}) => {
    const old = [...inner.children];
    const fs = fitSize(text, maxW, maxFs);
    h1.style.height = Math.round(maxFs) + 'px';
    const swapIn = () => {
      h1.style.fontSize = fs + 'px';
      const chars = split(inner, text);
      if (instant || reduce) return;
      gsap.fromTo(chars, { yPercent: 112 * dir, '--w': 75 }, { yPercent: 0, '--w': 100, duration: .95, stagger: .032, ease: 'expo.out' });
    };
    if (old.length && !instant && !reduce) {
      gsap.killTweensOf(old);
      gsap.timeline()
        .to(old, { yPercent: -112 * dir, '--w': 75, duration: .34, stagger: .014, ease: 'power3.in' })
        .add(swapIn);
    } else swapIn();
  };
  const bindSqueeze = h1 => {
    if (!fine || reduce) return;
    h1.addEventListener('pointermove', e => {
      $$('.ch', h1).forEach(ch => {
        const r = ch.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        gsap.to(ch, { '--w': 75 + 25 * Math.min(1, d / 240), duration: .5, ease: 'power3.out', overwrite: 'auto' });
      });
    });
    h1.addEventListener('pointerleave', () => gsap.to($$('.ch', h1), { '--w': 100, duration: 1, ease: 'elastic.out(1, .45)', overwrite: 'auto' }));
  };

  /* ---------------- text, CTA, stats ---------------- */
  const rollText = (el, text, delay = 0) => {
    if (reduce) { el.textContent = text; return; }
    gsap.timeline({ delay })
      .to(el, { yPercent: -100, opacity: 0, duration: .28, ease: 'power2.in' })
      .call(() => { el.textContent = text; })
      .fromTo(el, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, ease: 'expo.out' });
  };
  const setCta = s => {
    els.cta.href = `#/s/${s.id}`;
    if (reduce) { els.ctaLabel.textContent = CTA[s.id]; return; }
    const w0 = els.cta.getBoundingClientRect().width;
    gsap.timeline({ delay: .15 })
      .to(els.ctaLabel, { yPercent: -140, duration: .25, ease: 'power2.in' })
      .call(() => {
        els.ctaLabel.textContent = CTA[s.id];
        els.cta.style.width = 'auto';
        const w1 = els.cta.getBoundingClientRect().width;
        gsap.fromTo(els.cta, { width: w0 }, { width: w1, duration: .55, ease: 'expo.out', clearProps: 'width' });
      })
      .fromTo(els.ctaLabel, { yPercent: 140 }, { yPercent: 0, duration: .6, ease: 'expo.out' });
  };
  const countUp = el => {
    const v = el.dataset.v, m = v.match(/^([\d,]+)(.*)$/);
    if (!m || reduce || /^[A-Z]{2,}/.test(m[2]) || parseInt(m[1].replace(/,/g, ''), 10) < 10) { el.textContent = v; return; }
    const n = parseInt(m[1].replace(/,/g, ''), 10), suf = m[2], comma = m[1].includes(','), o = { v: 0 };
    gsap.to(o, { v: n, duration: 1.6, ease: 'expo.out', onUpdate: () => { const x = Math.round(o.v); el.textContent = (comma ? x.toLocaleString('en-US') : x) + suf; } });
  };
  const statsHTML = list => list.map(([v, l]) => `<div class="stat"><dt data-v="${v}">${v}</dt><dd>${l}</dd></div>`).join('');
  const renderStats = (stats, animate) => {
    const dl = els.stats, old = [...dl.children];
    const build = () => {
      dl.innerHTML = statsHTML(stats);
      $$('dt', dl).forEach(countUp);
      if (!reduce) gsap.from($$('.stat', dl), { y: 26, opacity: 0, duration: .8, stagger: .08, ease: 'expo.out' });
    };
    if (animate && old.length && !reduce) gsap.to(old, { y: -18, opacity: 0, duration: .24, stagger: .04, ease: 'power2.in', onComplete: build });
    else build();
  };

  /* ---------------- per-service visuals ---------------- */
  const heroVis = S.map(s => {
    const item = document.createElement('div');
    item.className = 'stage__item';
    els.stage.appendChild(item);
    return { item, v: XE.visuals[s.id](item) };
  });
  const swapVisual = (a, b) => {
    const A = heroVis[a], B = heroVis[b];
    gsap.killTweensOf([A.item, B.item]);
    if (reduce) {
      A.item.classList.remove('is-on'); A.v.pause();
      B.item.classList.add('is-on'); gsap.set(B.item, { opacity: 1, scale: 1, filter: 'none' });
      B.v.play(); setTimeout(() => B.v.pause(), 1800);
      return;
    }
    gsap.to(A.item, { opacity: 0, scale: .9, filter: 'blur(8px)', duration: .42, ease: 'power2.in', onComplete: () => { A.item.classList.remove('is-on'); A.v.pause(); } });
    B.item.classList.add('is-on');
    B.v.play();
    gsap.fromTo(B.item, { opacity: 0, scale: 1.08, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .95, delay: .32, ease: 'expo.out', clearProps: 'filter' });
  };

  /* ---------------- activate a service ---------------- */
  const activate = (i, how = 'auto') => {
    i = ((i % N) + N) % N;
    if (i === current) return;
    const prev = current; current = i;
    const s = S[i], dir = (how === 'prev' || how === 'key-prev') ? -1 : 1;
    if (how !== 'drag') wheel.rotateTo(i);
    wheel.setActive(i);
    flood(s.theme, wheel.origin());
    els.count.textContent = i + 1;
    els.srName.textContent = s.long;
    showWord(els.word, els.wordIn, s.name, { dir, ...heroBox() });
    rollText(els.desc, s.desc, .08);
    setCta(s);
    renderStats(s.stats, true);
    swapVisual(prev, i);
    startTimer();
    if (how !== 'auto') live.textContent = `${s.long}. ${s.desc}`;
  };

  /* ---------------- autoplay ---------------- */
  const startTimer = () => {
    timer && timer.kill();
    const o = { p: 0 };
    timer = gsap.to(o, { p: 1, duration: INTERVAL, ease: 'none', onUpdate: () => wheel.progress(o.p), onComplete: () => activate(current + 1, 'auto') });
    syncTimer();
  };
  const syncTimer = () => {
    if (!timer) return;
    const stop = userPaused || hoverPause || !heroVisible || !onHome || document.hidden;
    stop ? timer.pause() : timer.resume();
    wheel.setPaused(userPaused);
    const hub = $('.wheel .hub');
    hub && hub.setAttribute('data-cursor', userPaused ? 'Play' : 'Pause');
  };
  const togglePause = () => {
    userPaused = !userPaused;
    live.textContent = userPaused ? 'Auto-rotation paused' : 'Auto-rotation on';
    syncTimer();
  };

  /* ---------------- home-page sections ---------------- */
  const buildStatic = () => {
    els.marquee.innerHTML = [...XE.shows, ...XE.shows].map(x => `<span>${x}</span>`).join('');
    $('.contact__stripe').innerHTML = S.map(s => `<i style="background:${s.theme.bg}"></i>`).join('');

    const g = $('.gantt'), cols = XE.ganttCols, C = cols.length, showCol = cols.indexOf('Show');
    let html = `<div class="gantt__scale"><span></span><div class="gantt__ticks">${cols.map(c => `<span class="${c === 'Show' ? 'is-show' : ''}">${c}</span>`).join('')}</div></div>`;
    XE.ganttOrder.forEach(id => {
      const s = S.find(x => x.id === id), { from, to, note } = s.gantt;
      html += `<div class="gantt__row" role="listitem"><span class="gantt__name">${s.long}</span>
        <div class="gantt__track"><span class="gantt__show" style="left:${showCol / C * 100}%;width:${100 / C}%"></span>
        <a class="gantt__bar" href="#/s/${s.id}" style="left:${from / C * 100}%;width:${(to - from) / C * 100}%;background:${s.theme.bg};color:${s.theme.ink}">${s.name}<small>${note}</small></a></div></div>`;
    });
    g.innerHTML = html;
    $$('.gantt__row', g).forEach(r => {
      r.addEventListener('pointerenter', () => g.classList.add('is-dim'));
      r.addEventListener('pointerleave', () => g.classList.remove('is-dim'));
    });
    if (!reduce) {
      gsap.set($$('.gantt__bar', g), { scaleX: 0 });
      new IntersectionObserver((en, ob) => {
        if (!en[0].isIntersecting) return;
        ob.disconnect();
        gsap.to($$('.gantt__bar', g), { scaleX: 1, duration: 1.2, stagger: .09, ease: 'expo.out' });
      }, { threshold: .35 }).observe(g);
    }
  };

  /* ---------------- routing + service pages ---------------- */
  const wipeLabel = $('.wipe__label');
  const wipe = (color, [x, y], swap, label = '', labelColor = '#fff') => {
    if (reduce) { swap(); return; }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 60;
    gsap.killTweensOf([els.wipe, wipeLabel]);
    wipeLabel.textContent = label;
    wipeLabel.style.color = labelColor;
    gsap.timeline()
      .set(els.wipe, { background: color, yPercent: 0, clipPath: `circle(0px at ${x}px ${y}px)` })
      .to(els.wipe, { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: .72, ease: 'expo.inOut' })
      .fromTo(wipeLabel, { yPercent: 60, opacity: 0, '--w': 75 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out' }, .3)
      .call(swap)
      .to(els.wipe, { yPercent: -100, duration: .8, ease: 'expo.inOut' }, '+=.06')
      .set(els.wipe, { clipPath: 'circle(0px at 50% 50%)', yPercent: 0 });
  };
  const pageHTML = i => {
    const s = S[i], p = s.page, nx = S[(i + 1) % N];
    const rows = p.items.map(([t, d, tag]) => `<div class="sp-row"><h3>${t}</h3><p>${d}</p><span>${tag}</span></div>`).join('');
    const extra = p.extra.type === 'marquee'
      ? `<h2>${p.extra.title}</h2><div class="sp-marquee"><div class="marquee__track">${[...p.extra.items, ...p.extra.items].map(x => `<span>${x}</span>`).join('')}</div></div>`
      : `<h2>${p.extra.title}</h2><div class="sp-steps">${p.extra.items.map(([b, k, d]) => `<div class="sp-step"><i>${k}</i><b>${b}</b><p>${d}</p></div>`).join('')}</div>`;
    return `
      <section class="sp-hero">
        <div class="sp-copy">
          <a class="sp-back" href="#/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>All six services</a>
          <p class="sp-kicker">${p.kicker}</p>
          <h1 class="bigword"><span class="sr-only">${s.long}</span><span class="bigword__inner" aria-hidden="true"></span></h1>
          <p class="sp-desc">${s.desc}</p>
          <div class="hero__ctas">
            <a class="btn btn--primary magnetic" href="mailto:contact@xenialevents.com?subject=${encodeURIComponent(s.long + ' quote')}"><span class="btn__fill"></span><span class="btn__label">Get a quote</span></a>
            <a class="link" href="https://wa.me/971545865270">Message us on WhatsApp</a>
          </div>
        </div>
        <div class="sp-stage"></div>
      </section>
      <section class="sp-list"><h2>What we handle</h2><div class="sp-rows">${rows}</div></section>
      <dl class="sp-stats">${statsHTML(p.stats)}</dl>
      <section class="sp-extra">${extra}</section>
      <a class="sp-next" href="#/s/${nx.id}" style="--next-bg:${nx.theme.bg};--next-ink:${nx.theme.ink}"><span class="sp-next__k">Next service</span><span class="sp-next__w">${nx.name}</span></a>
      <footer class="ftr"><span>Abu Dhabi HQ, Dubai, Riyadh, Doha</span><span>Concept prototype for internal review. Not the live site.</span></footer>`;
  };
  const pageBox = h1 => ({
    maxW: h1.parentElement.clientWidth,
    maxFs: mqMobile.matches ? innerWidth * .2 : Math.min(innerHeight * .2, 200)
  });
  const renderPage = i => {
    pageIndex = i;
    if (pageVis) pageVis.pause();
    els.page.innerHTML = pageHTML(i);
    const h1 = $('.bigword', els.page), inner = $('.bigword__inner', els.page);
    showWord(h1, inner, S[i].name, { ...pageBox(h1), instant: true });
    bindSqueeze(h1);
    const item = document.createElement('div');
    item.className = 'stage__item is-on';
    $('.sp-stage', els.page).appendChild(item);
    pageVis = XE.visuals[S[i].id](item);
    pageVis.play();
    bindMagnetic(els.page);
    const st = $('.sp-stats', els.page);
    new IntersectionObserver((en, ob) => {
      if (!en[0].isIntersecting) return;
      ob.disconnect();
      $$('dt', st).forEach(countUp);
    }, { threshold: .4 }).observe(st);
    if (!reduce) {
      const chars = $$('.ch', inner);
      gsap.timeline({ delay: .3 })
        .fromTo(chars, { yPercent: 112, '--w': 75 }, { yPercent: 0, '--w': 100, duration: 1, stagger: .035, ease: 'expo.out' })
        .from([$('.sp-back', els.page), $('.sp-kicker', els.page)], { y: 20, opacity: 0, duration: .7, stagger: .06, ease: 'expo.out' }, 0)
        .from([$('.sp-desc', els.page), ...$$('.sp-hero .hero__ctas > *', els.page)], { y: 26, opacity: 0, duration: .8, stagger: .07, ease: 'expo.out' }, .2)
        .from($('.sp-stage', els.page), { opacity: 0, scale: .94, duration: 1.1, ease: 'expo.out' }, .15);
    }
  };
  const goService = (i, instant) => {
    const s = S[i];
    const color = onHome ? s.theme.ink : s.theme.bg;
    const swap = () => {
      onHome = false;
      if (floodTl) floodTl.progress(1).kill();
      heroVis[current].v.pause();
      syncTimer();
      els.home.hidden = true;
      els.page.hidden = false;
      setTheme(s.theme);
      renderPage(i);
      window.scrollTo(0, 0);
    };
    instant ? swap() : wipe(color, lastClick, swap, s.long, onHome ? s.theme.bg : s.theme.ink);
  };
  const goHome = anchor => {
    wipe(S[pageIndex].theme.ink, lastClick, () => {
      if (pageVis) { pageVis.pause(); pageVis = null; }
      els.page.hidden = true;
      els.page.innerHTML = '';
      els.home.hidden = false;
      onHome = true;
      setTheme(S[current].theme);
      heroVis[current].v.play();
      refit();
      const target = anchor && document.querySelector(anchor);
      target ? target.scrollIntoView() : window.scrollTo(0, 0);
      syncTimer();
    }, 'Six services', S[pageIndex].theme.bg);
  };
  const serviceFromHash = () => {
    const m = location.hash.match(/^#\/s\/([\w-]+)/);
    return m ? S.findIndex(s => s.id === m[1]) : -1;
  };
  const onRoute = () => {
    const i = serviceFromHash();
    if (i >= 0) { goService(i, false); return; }
    if (!onHome) goHome(location.hash.startsWith('#/') ? null : location.hash);
  };

  /* ---------------- cursor + magnetic ---------------- */
  function bindMagnetic(scope = document) {
    if (!fine || reduce) return;
    $$('.magnetic', scope).forEach(b => {
      const qx = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3.out' });
      const qy = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3.out' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * .25);
        qy((e.clientY - r.top - r.height / 2) * .4);
        b.style.setProperty('--fx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--fy', (e.clientY - r.top) + 'px');
      });
      b.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }
  const initCursor = () => {
    if (!fine) return;
    body.classList.add('has-cursor');
    const c = $('.cursor'), ring = $('.cursor__ring'), dot = $('.cursor__dot'), label = $('.cursor__label');
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });
    const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
    gsap.set(c, { opacity: 0 });
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      gsap.set(c, { opacity: 1 });
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    });
    document.addEventListener('pointerleave', () => gsap.set(c, { opacity: 0 }));
    document.addEventListener('pointerover', e => {
      c.classList.toggle('is-dark', !!e.target.closest('.lifecycle, .contact, .ftr'));
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button');
      if (lab && !(link && lab.contains(link))) {
        label.textContent = lab.getAttribute('data-cursor');
        c.classList.add('is-label'); c.classList.remove('is-link');
      } else if (link) {
        c.classList.remove('is-label'); c.classList.add('is-link');
      } else c.classList.remove('is-label', 'is-link');
    });
    addEventListener('pointerdown', () => c.classList.add('is-down'));
    addEventListener('pointerup', () => c.classList.remove('is-down'));
  };

  /* ---------------- intro: logo → wheel hub → hero ---------------- */
  const heroIn = () => {
    const tl = gsap.timeline();
    const chars = $$('.ch', els.wordIn);
    tl.from('.hdr', { y: -24, opacity: 0, duration: .9, ease: 'expo.out' }, 0)
      .from([els.statement, els.ctrl], { y: 22, opacity: 0, duration: .8, stagger: .06, ease: 'expo.out' }, .05)
      .fromTo(chars, { yPercent: 112, '--w': 75 }, { yPercent: 0, '--w': 100, duration: 1, stagger: .04, ease: 'expo.out' }, .1)
      .from(els.desc, { yPercent: 100, opacity: 0, duration: .9, ease: 'expo.out' }, .3)
      .from('.hero__ctas > *', { y: 22, opacity: 0, duration: .8, stagger: .07, ease: 'expo.out' }, .38)
      .call(() => renderStats(S[0].stats, false), null, .45)
      .from(els.stage, { opacity: 0, scale: .92, duration: 1.1, ease: 'expo.out' }, .3)
      .call(() => heroVis[0].v.play(), null, .3)
      .from('.hero__marquee', { opacity: 0, duration: .9 }, .6);
    return tl;
  };
  const runIntro = () => {
    const mark = $('.intro__mark');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.intro__mark .ix', { x: -90, opacity: 0, duration: .6 }, 0)
      .from('.intro__mark .ie', { x: 110, opacity: 0, duration: .55, stagger: .07 }, .06)
      .from('.intro__mark .io', { scale: 0, transformOrigin: '50% 50%', duration: .55, ease: 'back.out(2.4)' }, .24)
      .fromTo('.intro__line', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, .28)
      .addLabel('fly', '+=.08')
      .add(() => {
        const lr = wheel.logoRect(), mr = mark.getBoundingClientRect();
        const [hx, hy, hr] = wheel.hubCircle();
        gsap.to(mark, {
          x: lr.left + lr.width / 2 - (mr.left + mr.width / 2),
          y: lr.top + lr.height / 2 - (mr.top + mr.height / 2),
          scale: lr.width / mr.width, duration: .85, ease: 'expo.inOut'
        });
        gsap.to(els.intro, { clipPath: `circle(${hr}px at ${hx}px ${hy}px)`, duration: .85, ease: 'expo.inOut' });
      }, 'fly')
      .to('.intro__line', { opacity: 0, y: -8, duration: .25, ease: 'power2.in' }, 'fly')
      .add(wheel.intro(), 'fly+=.3')
      .add(heroIn(), 'fly+=.5')
      .to(els.intro, { opacity: 0, duration: .3, ease: 'power1.out' }, 'fly+=.85')
      .call(() => { els.intro.remove(); body.classList.remove('is-loading'); startTimer(); }, null, 'fly+=1.15');
  };

  /* ---------------- resize ---------------- */
  const refit = () => {
    wheel.setPointer(mqMobile.matches ? 270 : 180);
    const box = heroBox();
    els.word.style.height = Math.round(box.maxFs) + 'px';
    els.word.style.fontSize = fitSize(S[current].name, box.maxW, box.maxFs) + 'px';
    const ph = $('.bigword', els.page);
    if (ph && !els.page.hidden) {
      const pb = pageBox(ph);
      ph.style.height = Math.round(pb.maxFs) + 'px';
      ph.style.fontSize = fitSize(S[pageIndex].name, pb.maxW, pb.maxFs) + 'px';
    }
  };
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(refit, 120); });

  /* ---------------- init ---------------- */
  const init = () => {
    setTheme(S[0].theme);
    wheel = XE.Wheel($('.wheel'), S, {
      pointer: () => (mqMobile.matches ? 270 : 180),
      onSelect: (i, how) => activate(i, how),
      onHub: togglePause
    });
    buildStatic();

    const s = S[0], box = heroBox();
    showWord(els.word, els.wordIn, s.name, { ...box, instant: true });
    els.desc.textContent = s.desc;
    els.ctaLabel.textContent = CTA[s.id];
    els.srName.textContent = s.long;
    heroVis[0].item.classList.add('is-on');
    bindSqueeze(els.word);
    bindMagnetic();
    initCursor();

    $('.ctrl--prev').addEventListener('click', () => activate(current - 1, 'prev'));
    $('.ctrl--next').addEventListener('click', () => activate(current + 1, 'next'));
    [$('.wheel-wrap'), els.stage].forEach(el => {
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hoverPause = true; syncTimer(); } });
      el.addEventListener('pointerleave', () => { hoverPause = false; syncTimer(); });
    });
    let downAt = null;
    els.stage.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
    els.stage.addEventListener('click', e => {
      if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
      location.hash = `#/s/${S[current].id}`;
    });
    document.addEventListener('pointerdown', e => { lastClick = [e.clientX, e.clientY]; }, true);
    document.addEventListener('visibilitychange', syncTimer);
    new IntersectionObserver(en => { heroVisible = en[0].isIntersecting; syncTimer(); }, { threshold: .3 }).observe(els.hero);
    addEventListener('hashchange', onRoute);

    const startOnPage = serviceFromHash();
    if (startOnPage >= 0 || reduce) {
      els.intro.remove();
      body.classList.remove('is-loading');
      renderStats(s.stats, false);
      heroVis[0].v.play();
      if (reduce) setTimeout(() => heroVis[0].v.pause(), 1800);
      startTimer();
      if (startOnPage >= 0) goService(startOnPage, true);
    } else {
      runIntro();
    }
  };

  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1500))]);
  fontsReady.then(init);
})();
