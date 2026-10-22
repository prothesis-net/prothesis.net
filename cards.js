/* cards.js — the four cards on the arc, "Our first app" (v6 preview, 2026-10-22).
   Desktop (1024 px and up): "+" turns the row into a STAGE. The arc and the four cards pin where the row stood, and the
   page scroll drives everything from there, read once a frame:
     part   — the other cards roll off to the sides, a Navy panel fills in with the open card's phone in the middle
              ("+" itself carries the scroll through this, slowly, so the click reads as the card expanding);
     screens — every screen gets the same stretch of scroll, and changes over the middle of its stretch;
     return — after the last screen holds, the three roll back in;
     settle — the four cards stay pinned, closed, for a few more scrolls before the page moves on.
   Scrolling back up runs it all in reverse. "×" closes by easing the panel out where it stands, never by scrolling.
   Under 1024 px: the card opens in place, its words and phone pinned inside it while its screens change.
   Reduce Motion: no pinning and no easing; the screens as a plain list. Motion is transform and opacity only. */
(function () {
  var wrap = document.querySelector('[data-cards]');
  if (!wrap) return;
  var stage = wrap.querySelector('.cards-stage');
  var row = wrap.querySelector('.cards-row');
  var arcSvg = row.querySelector('.arc-line');
  var obody = row.querySelector('.obody');
  var oscreen = obody.querySelector('.oscreen');
  var rmPanel = wrap.querySelector('.rm-panel');
  var cards = [].slice.call(row.querySelectorAll('.card'));

  var STICK = 16;
  // Scroll lengths, in viewport heights.
  // pre = 0: once the band has settled, the very next scroll starts the next screen (no dead stretch first).
  var D = { part: 0.6, pre: 0, seg: 0.6, post: 0.5, back: 0.6, settle: 0.8 };
  var M = { pre: 0, seg: 0.6, post: 0.5 };
  var OPEN_MS = 1600;   // "+": the part, played on a clock while the scroll glides to where it ends
  var CLOSE_MS = 1000;  // "×": the panel easing out where it stands

  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqWide = window.matchMedia('(min-width: 1024px)');
  var open = null;      // { card, mode: 'stage' | 'inplace' | 'rm', shots: [img], n, L, pin }
  var frame = 0, anim = null, closing = false;
  var held = null;      // while "+" plays the part on a clock: { p } (the scroll read leaves the part alone)

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ease(t) { return 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1)); }   // sine in-out: no hard start or stop
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function vh() { return window.innerHeight; }
  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function flowOf(card) {
    return [].slice.call(card.querySelectorAll('.flow img')).map(function (im) {
      return { src: im.getAttribute('src'), alt: im.getAttribute('alt') };
    });
  }
  function words(card) {
    return { k: card.querySelector('.card-kicker').textContent, h: card.querySelector('.card-head').innerHTML };
  }

  /* ---------- the arc and its glint ---------- */
  var ARC_TOP = 14, RISE = 48, geo = null, glint = null, glintMode = 'idle';
  var NS = 'http://www.w3.org/2000/svg';
  function arcGeom(W) {
    var R = (W * W / 4 + RISE * RISE) / (2 * RISE), cx = W / 2, cy = ARC_TOP + R;
    return { W: W, R: R, cx: cx, cy: cy, end: ARC_TOP + RISE,
      yAt: function (x) { return cy - Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx))); } };
  }
  function el(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function drawArc() {
    var W = Math.max(200, row.getBoundingClientRect().width);
    var g = arcGeom(W);
    arcSvg.setAttribute('width', W); arcSvg.setAttribute('height', g.end + 10);
    arcSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + (g.end + 10));
    arcSvg.innerHTML = '';
    var defs = el('defs', {});
    var gb = el('linearGradient', { id: 'g2b', x1: 0, x2: 1, y1: 0, y2: 0 });
    [[0, 0], [0.3, 1], [0.7, 1], [1, 0]].forEach(function (s) { gb.appendChild(el('stop', { offset: s[0], 'stop-color': '#D6BA6B', 'stop-opacity': s[1] })); });
    var gc = el('linearGradient', { id: 'g2c', x1: 0, x2: 1, y1: 0, y2: 0 });
    [[0, 0], [0.5, 1], [1, 0]].forEach(function (s) { gc.appendChild(el('stop', { offset: s[0], 'stop-color': '#EAE2C6', 'stop-opacity': s[1] })); });
    defs.appendChild(gb); defs.appendChild(gc); arcSvg.appendChild(defs);
    arcSvg.appendChild(el('path', { class: 'arc-path', d: 'M 0 ' + g.end + ' A ' + g.R + ' ' + g.R + ' 0 0 1 ' + W + ' ' + g.end }));
    var half = 34 / g.R, gx1 = g.cx - g.R * Math.sin(half), gx2 = g.cx + g.R * Math.sin(half), gy = g.cy - g.R * Math.cos(half);
    var endDeg = Math.asin(Math.min(1, g.cx / g.R)) * 180 / Math.PI;
    glint = el('g', { class: 'glint2 ' + glintMode });
    glint.style.transformOrigin = g.cx + 'px ' + g.cy + 'px';
    glint.style.setProperty('--gl', -endDeg + 'deg'); glint.style.setProperty('--gr', endDeg + 'deg');
    var seg = el('g', { class: 'glint2-seg' });
    var d = 'M ' + gx1 + ' ' + gy + ' A ' + g.R + ' ' + g.R + ' 0 0 1 ' + gx2 + ' ' + gy;
    seg.appendChild(el('path', { class: 'glint2-b', d: d, stroke: 'url(#g2b)' }));
    seg.appendChild(el('path', { class: 'glint2-c', d: d, stroke: 'url(#g2c)' }));
    glint.appendChild(seg); arcSvg.appendChild(glint);
    if (glintMode === 'open') glint.style.transform = 'rotate(0deg)';
    geo = g;
  }
  // Idle: the slow drift along the arc. Open: the glint glides to the crown, over the open panel, and breathes there.
  function setGlint(mode) {
    if (!glint || mode === glintMode) return;
    if (mode === 'open') {
      var now = getComputedStyle(glint).transform;   // where the drift has it, so it glides from there
      glint.style.transform = now === 'none' ? '' : now;
      glint.classList.remove('idle'); glint.getBoundingClientRect();
      glint.classList.add('open'); glint.style.transform = 'rotate(0deg)';
    } else {
      glint.classList.remove('open'); glint.style.transform = '';
      glint.classList.add('idle');
    }
    glintMode = mode;
  }

  /* ---------- placing the cards on the arc (desktop) ---------- */
  var ptop = 0;
  function place() {
    if (!mqWide.matches) {
      cards.forEach(function (c) { c.style.marginTop = ''; c.style.removeProperty('--dx'); });
      return;
    }
    drawArc();
    var gutter = cards.length > 1 ? Math.round(cards[1].offsetLeft - (cards[0].offsetLeft + cards[0].offsetWidth)) : 20;
    var tops = cards.map(function (c) {
      var L = c.offsetLeft, W = c.offsetWidth;
      return Math.round(Math.max(geo.yAt(L + 28), geo.yAt(L + W - 28)) + 1.25 + gutter);
    });
    cards.forEach(function (c, i) { c.style.marginTop = tops[i] + 'px'; });
    ptop = Math.max.apply(null, tops);
    row.style.setProperty('--ptop', ptop + 'px');
    if (open && open.mode === 'stage') setDx();
  }
  // The others roll all the way off the screen (not just off the row), so nothing is cut at a line; measured in layout
  // terms (offsetLeft + the row's place on screen), since the cards may already be moved by transforms.
  function setDx() {
    var rowW = row.offsetWidth, rowX = row.getBoundingClientRect().left, vw = document.documentElement.clientWidth;
    var oi = cards.indexOf(open.card);
    cards.forEach(function (c, i) {
      var L = c.offsetLeft, W = c.offsetWidth, x = rowX + L;
      var dx = i < oi ? -(x + W + 24) : i > oi ? vw - x + 24 : rowW / 2 - (L + W / 2);
      c.style.setProperty('--dx', Math.round(dx) + 'px');
    });
  }

  /* ---------- the screens: each gets the same stretch, and changes over its middle ---------- */
  function fillScreens(host, shots) {
    host.innerHTML = '';
    return shots.map(function (s) {
      var im = new Image(); im.src = s.src; im.alt = s.alt; im.decoding = 'async';
      host.appendChild(im); return im;
    });
  }
  // The next screen rises in OVER the current one and turns solid quickly, so the two are never half-and-half for long
  // (a 50/50 blend of two screens of text reads as a glitch); the current one stays solid underneath until covered.
  // The change sits at the START of each screen's stretch and the pause after it, so a scroll always answers at once.
  function showAt(imgs, idx) {
    var k = Math.floor(idx), f = idx - k;
    var rise = smooth(0.03, 0.4, f), solid = smooth(0.03, 0.25, f);
    if (k >= imgs.length - 1) { k = imgs.length - 1; rise = solid = 0; }
    imgs.forEach(function (im, j) {
      var o = 0, tf = '';
      if (j === k) { o = 1; tf = 'scale(' + (1 - 0.012 * rise).toFixed(4) + ')'; }
      else if (j === k + 1) { o = solid; tf = 'translateY(' + ((1 - rise) * 18).toFixed(2) + 'px)'; }
      im.style.opacity = o; im.style.transform = tf;
      im.style.zIndex = j === k + 1 ? 2 : 1;
      if (o > 0.5) im.removeAttribute('aria-hidden'); else im.setAttribute('aria-hidden', 'true');
    });
  }

  /* ---------- the part: one progress (0 → 1), each piece on its own soft curve so they overlap ---------- */
  // --pm the cards rolling off (sine), --pf the open card's face fading early, --pp the panel filling in through the
  // middle, --pb the words and phone arriving last. Set on the row; everything inside inherits them.
  function applyPart(p) {
    var st = row.style;
    st.setProperty('--pm', ease(p).toFixed(4));
    st.setProperty('--pf', smooth(0, 0.5, p).toFixed(4));
    st.setProperty('--pp', smooth(0.1, 0.65, p).toFixed(4));
    st.setProperty('--pb', smooth(0.45, 1, p).toFixed(4));
    row.dataset.p = p.toFixed(4);
    obody.classList.toggle('live', p > 0.9);
    obody.setAttribute('aria-hidden', p > 0.5 ? 'false' : 'true');
    cards.forEach(function (c) { c.inert = p > 0.5; });
    setGlint(p > 0.3 ? 'open' : 'idle');
  }
  function clearPart() {
    ['--pm', '--pf', '--pp', '--pb'].forEach(function (k) { row.style.removeProperty(k); });
    delete row.dataset.p;
  }

  /* ---------- the scroll read, once a frame ---------- */
  function read() {
    frame = 0;
    if (!open || closing) return;
    var V = vh();
    if (open.mode === 'stage') {
      var s = clamp(STICK - stage.getBoundingClientRect().top, 0, open.L), a = s / V;
      var part = clamp(a / D.part, 0, 1);
      var idx = clamp((a - D.part - D.pre) / D.seg, 0, open.n - 1);
      var a0 = D.part + D.pre + (open.n - 1) * D.seg + D.post;
      var back = clamp((a - a0) / D.back, 0, 1);
      showAt(open.imgs, idx);
      if (!held) applyPart(part * (1 - back));
    } else if (open.mode === 'inplace') {
      var top = open.card.getBoundingClientRect().top;
      var s2 = clamp(open.settleTop - top, 0, open.L), a2 = s2 / V;
      showAt(open.imgs, clamp((a2 - M.pre) / M.seg, 0, open.n - 1));
    }
  }
  function onScroll() { if (!frame) frame = requestAnimationFrame(read); }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- a slow, cancellable scroll ---------- */
  function stopAnim() { if (anim) { cancelAnimationFrame(anim.id); anim = null; } }
  function scrollTween(to, ms) {
    stopAnim();
    var from = window.scrollY, t0 = performance.now();
    if (Math.abs(to - from) < 2) return;
    anim = { id: 0 };
    var step = function (t) {
      var k = clamp((t - t0) / ms, 0, 1);
      window.scrollTo(0, from + (to - from) * ease(k));
      if (k < 1 && anim) anim.id = requestAnimationFrame(step); else anim = null;
    };
    anim.id = requestAnimationFrame(step);
  }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function () { stopAnim(); }, { passive: true });
  });

  /* ---------- open ---------- */
  function setExpanded(card) {
    cards.forEach(function (c) { c.querySelector('.card-plus').setAttribute('aria-expanded', c === card ? 'true' : 'false'); });
  }
  function openCard(card) {
    if (closing) return;
    var shots = flowOf(card);
    if (mqRM.matches) return openPlain(card, shots);
    if (mqWide.matches) return openStage(card, shots);
    return openInPlace(card, shots);
  }

  function openStage(card, shots) {
    var V = vh();
    var rowTop = row.getBoundingClientRect().top;      // keep the row exactly where it stands
    if (open) teardown();
    var n = shots.length;
    var L = V * (D.part + D.pre + (n - 1) * D.seg + D.post + D.back + D.settle);
    var pinH = V - STICK * 2;
    wrap.classList.add('is-stage');
    wrap.style.setProperty('--pinh', pinH + 'px');
    stage.style.height = (pinH + L) + 'px';
    var w = words(card);
    obody.querySelector('.card-kicker').textContent = w.k;
    obody.querySelector('.card-head').innerHTML = w.h;
    row.style.setProperty('--phh', Math.round(Math.min(620, pinH - ptop - 170)) + 'px');
    obody.hidden = false;
    var imgs = fillScreens(oscreen, shots);
    cards.forEach(function (c) { c.classList.toggle('is-open-face', c === card); });
    open = { card: card, mode: 'stage', imgs: imgs, n: n, L: L };
    setDx(); setExpanded(card);
    // If the row was pinned (a card opened from the settle), hold it there; then carry the scroll through the part.
    var sTop = docTop(stage);
    if (rowTop <= STICK + 1) window.scrollTo(0, sTop - STICK);
    // The part plays on a clock (one curve, no stutter from the scroll), while the scroll glides to where the part
    // ends; when the clock finishes, the scroll read takes over from exactly the same picture.
    var target = sTop - STICK + V * (D.part + D.pre);
    held = { p: 0 };
    applyPart(0); read();
    scrollTween(target, OPEN_MS);
    var t0 = performance.now();
    var step = function (t) {
      if (!held || !open || open.card !== card) return;
      var k = clamp((t - t0) / OPEN_MS, 0, 1);
      applyPart(k);
      if (k < 1) { requestAnimationFrame(step); return; }
      held = null;
      if (window.scrollY < target - 1) window.scrollTo(0, target);   // only if a wheel cut the glide short (the row is pinned there)
      read();
      obody.querySelector('.card-x').focus({ preventScroll: true });
    };
    requestAnimationFrame(step);
  }

  function openInPlace(card, shots) {
    // Switching from another open card: close it WITHOUT moving the page for it, then hold the card just tapped
    // exactly where it was on screen (the closing card may sit above it and shrink).
    if (open) {
      var tapTop = card.getBoundingClientRect().top;
      teardown(true);
      window.scrollTo(0, docTop(card) - tapTop);
    }
    var V = vh(), n = shots.length;
    var pin = document.createElement('div');
    pin.className = 'cpin';
    var w = words(card);
    pin.innerHTML = '<button type="button" class="card-btn card-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>' +
      '<p class="card-kicker"></p><h3 class="card-head"></h3><div class="ophone"><div class="oscreen"></div></div>';
    pin.querySelector('.card-kicker').textContent = w.k;
    pin.querySelector('.card-head').innerHTML = w.h;
    card.appendChild(pin);
    var imgs = fillScreens(pin.querySelector('.oscreen'), shots);
    var L = V * (M.pre + (n - 1) * M.seg + M.post);
    card.classList.add('is-open');
    // Settle like a framed view: the card's navy fills the screen (its top just above the top edge) and the words +
    // phone sit centred, with room above and below; the screens start changing from there.
    var pinH = pin.offsetHeight;
    var stickM = Math.max(STICK, Math.round((V - pinH) / 2));
    var settleTop = -24;
    pin.style.top = stickM + 'px';
    card.style.setProperty('--cardh', Math.round(stickM - settleTop + pinH + L + 40) + 'px');
    open = { card: card, mode: 'inplace', imgs: imgs, n: n, L: L, pin: pin, settleTop: settleTop };
    setExpanded(card);
    read();
    scrollTween(docTop(card) - settleTop, 1000);
    pin.querySelector('.card-x').focus({ preventScroll: true });
  }

  function openPlain(card, shots) {
    if (open) teardown();
    var w = words(card);
    rmPanel.innerHTML = '<button type="button" class="card-btn card-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>' +
      '<p class="card-kicker"></p><h3 class="card-head"></h3><div class="rm-list"></div>';
    rmPanel.querySelector('.card-kicker').textContent = w.k;
    rmPanel.querySelector('.card-head').innerHTML = w.h;
    shots.forEach(function (s) { var im = new Image(); im.src = s.src; im.alt = s.alt; rmPanel.querySelector('.rm-list').appendChild(im); });
    rmPanel.hidden = false;
    open = { card: card, mode: 'rm' };
    setExpanded(card);
    window.scrollTo(0, docTop(rmPanel) - STICK);
    rmPanel.querySelector('.card-x').focus({ preventScroll: true });
  }

  /* ---------- close ---------- */
  // Takes the open state down at once, keeping the row (or the card) where it stands on screen.
  function teardown(stay) {   // stay: leave the page where it is (the caller places it)
    if (!open) return;
    var o = open; open = null; held = null;
    if (o.mode === 'stage') {
      var rowTop = row.getBoundingClientRect().top;
      wrap.classList.remove('is-stage');
      stage.style.height = '';
      obody.hidden = true; obody.classList.remove('live'); oscreen.innerHTML = '';
      clearPart();
      cards.forEach(function (c) { c.classList.remove('is-open-face'); c.style.removeProperty('--dx'); c.inert = false; });
      window.scrollTo(0, docTop(row) - rowTop);
      setGlint('idle');
    } else if (o.mode === 'inplace') {
      var cTop = o.card.getBoundingClientRect().top;
      o.card.classList.remove('is-open'); o.card.style.removeProperty('--cardh');
      if (o.pin) o.pin.remove();
      if (!stay) window.scrollTo(0, docTop(o.card) - Math.max(STICK, cTop));
    } else {
      rmPanel.hidden = true; rmPanel.innerHTML = '';
    }
    setExpanded(null);
  }
  function closeCard() {
    if (!open || closing) return;
    stopAnim();
    var card = open.card;
    if (open.mode !== 'stage') { teardown(); card.querySelector('.card-plus').focus({ preventScroll: true }); return; }
    // Ease the panel out where it stands; the cards roll back in. No scrolling.
    closing = true; held = null;
    var from = parseFloat(row.dataset.p) || 0, t0 = performance.now();
    setGlint('idle');
    var step = function (t) {
      var k = clamp((t - t0) / CLOSE_MS, 0, 1);
      applyPart(from * (1 - k));
      if (k < 1) requestAnimationFrame(step);
      else { closing = false; teardown(); card.querySelector('.card-plus').focus({ preventScroll: true }); }
    };
    requestAnimationFrame(step);
  }

  /* ---------- wiring ---------- */
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) {
      if (e.target.closest('.card-x')) return;
      if (open && open.card === c && open.mode !== 'stage') return;
      openCard(c);
    });
  });
  wrap.addEventListener('click', function (e) { if (e.target.closest('.card-x')) { e.stopPropagation(); closeCard(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeCard(); });

  var lastWide = mqWide.matches;
  window.addEventListener('resize', function () {
    if (mqWide.matches !== lastWide) { lastWide = mqWide.matches; if (open) teardown(); }
    place(); onScroll();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  window.addEventListener('load', place);
  place();
})();
