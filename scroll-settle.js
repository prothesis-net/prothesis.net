/* scroll-settle.js — the home page moves chapter by chapter, kept in its lanes.
   Each flick of the wheel or trackpad, each swipe, each scrolling key is read as an intent, and the page glides on its
   own (a long, soft ease, a little under a second for a whole screen) to the next place it rests in that direction.
   At rest one chapter fills the screen; the next is never half in view.
     - A chapter rests at its top; one taller than the screen also at its bottom (more steps if it is much taller), so
       nothing is out of reach and no step is longer than a screen.
     - "Our first app": its top (on desktop, as low as it takes to show the cards whole), then (on phones) each card in
       the middle of the screen, then its bottom.
     - With a flow open, each flick is one screen; the glide skips the stretches of scroll where nothing on screen
       changes (the places come from cards.js), so the change is all there is to see.
   On desktop a gold arc at the right edge shows where the reader is and takes them to any chapter.
   On phones the page follows the finger, then glides on (or back) on release, carrying on at the finger's own speed
   rather than starting again from still. Off under Reduce Motion, when the page
   is pinch-zoomed, and without JavaScript; the scroll bar still scrolls freely. */
(function () {
  var chapters = [].slice.call(document.querySelectorAll('.home .ch, .home .ch-app'));
  if (!chapters.length || !window.requestAnimationFrame) return;
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqWide = window.matchMedia('(min-width: 1024px)');

  var STEP = 0.85;   // the longest step inside a tall chapter, as a share of the screen
  var CARD_GAP = 40, appRowH = 0;   // "Our first app" on desktop: room below the cards at its first stop; the row's height
  var anim = null, pending = 0;

  function vh() { return window.innerHeight; }
  function maxY() { return document.documentElement.scrollHeight - vh(); }
  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function off() { return mqRM.matches || (window.visualViewport && window.visualViewport.scale > 1.01); }
  function lanes() { return window.prothesisCardLanes ? window.prothesisCardLanes() : { rests: [], wins: [], after: 0 }; }

  /* ---------- where the page rests ---------- */
  function fill(a, b, out) {   // a to b in even steps no longer than STEP screens, both ends included
    var n = Math.max(1, Math.ceil((b - a) / (STEP * vh()) - 0.001));
    for (var j = 0; j <= n; j++) out.push(a + (b - a) * j / n);
  }
  function chapterStops(ch, out) {
    var V = vh(), top = docTop(ch), end = top + ch.offsetHeight - V;
    if (end <= top + 1) { out.push(top); return; }
    if (ch.classList.contains('ch-app')) {
      var pts = [top];
      // Desktop: the first stop shows the four cards whole, their bottom CARD_GAP above the screen's edge, even if
      // the room above the heading (or, on a short screen, the arc) goes. The row's height is read with the cards closed.
      var stage = ch.querySelector('.cards-stage'), row = ch.querySelector('.cards-row');
      if (row && !ch.querySelector('.cards-wrap.is-stage')) appRowH = row.offsetHeight;
      if (mqWide.matches && stage) pts[0] = Math.min(end, Math.max(top, docTop(stage) + appRowH + CARD_GAP - V));
      if (!mqWide.matches) [].forEach.call(ch.querySelectorAll('.card'), function (c) {
        pts.push(docTop(c) + c.offsetHeight / 2 - V / 2);
      });
      pts.push(end);
      pts = pts.filter(function (p) { return p >= top && p <= end; }).sort(byNum);
      // A card already whole at the previous stop needs no step of its own. On desktop the two stops show different
      // things (the heading with the cards, then the words below them), so a shorter step still counts.
      var near = (mqWide.matches ? 0.1 : 0.3) * V;
      pts = pts.reduce(function (keep, p) {
        if (p - keep[keep.length - 1] >= near) keep.push(p);
        else if (p === end) keep[keep.length - 1] = Math.max(keep[keep.length - 1], p);
        return keep;
      }, [pts[0]]);
      // Only a little taller than the screen (on desktop, top and bottom merged): one stop, or the chapter is skipped.
      if (pts.length === 1) { out.push(pts[0]); return; }
      for (var i = 0; i < pts.length - 1; i++) fill(pts[i], pts[i + 1], out);
      return;
    }
    // A chapter whose words fit on one screen is one stop, framed round its words (never past its own ends): two stops
    // a few dozen pixels apart would make a swipe seem to do nothing.
    var inner = ch.querySelector('.inner');
    if (inner) {
      var r = inner.getBoundingClientRect(), cTop = r.top + window.scrollY, cH = r.height;
      if (cH <= V - 24) { out.push(Math.max(top, Math.min(end, cTop - (V - cH) / 2))); return; }
    }
    fill(top, end, out);
  }
  function byNum(a, b) { return a - b; }
  function stops(L) {
    var out = [], M = maxY();
    chapters.forEach(function (ch) { chapterStops(ch, out); });
    out.push(M);
    if (L.rests.length) {   // a flow is open: inside its stretch, only its own rests
      var a = L.rests[0] - 2, b = L.after + 2;
      out = out.filter(function (y) { return y < a || y > b; });
      out = out.filter(function (y) { return !L.rests.some(function (r) { return Math.abs(r - y) < 24; }); });
    }
    out = out.map(function (y) { return Math.round(Math.max(0, Math.min(M, y))); }).sort(byNum);
    var kept = [];
    out.forEach(function (y) { if (kept.length && y - kept[kept.length - 1] < 24) kept[kept.length - 1] = y; else kept.push(y); });
    return kept.concat(L.rests).sort(byNum);
  }
  // Stretches the glide passes over at once: in an open flow, where nothing on screen changes.
  function deadZones(L) {
    var d = [], r = L.rests;
    for (var i = 0; i < r.length - 1; i++) {
      var w = L.wins[i];
      if (!w) continue;
      if (w[0] > r[i]) d.push([r[i], w[0]]);
      if (r[i + 1] > w[1]) d.push([w[1], r[i + 1]]);
    }
    if (r.length && L.after > r[r.length - 1]) d.push([r[r.length - 1], L.after]);
    return d;
  }
  function nextStop(S, y, dir) {
    var t;
    if (dir > 0) { for (var i = 0; i < S.length; i++) if (S[i] > y + 2) { t = S[i]; break; } }
    else { for (var j = S.length - 1; j >= 0; j--) if (S[j] < y - 2) { t = S[j]; break; } }
    return t;
  }

  /* ---------- the glide ---------- */
  // cubic-bezier(.45, 0, .2, 1): a soft start and a long, gentle landing.
  var ease = (function (x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function X(t) { return ((ax * t + bx) * t + cx) * t; }
    function Y(t) { return ((ay * t + by) * t + cy) * t; }
    function dX(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (s) {
      var t = s;
      for (var i = 0; i < 8; i++) { var e = X(t) - s, d = dX(t); if (Math.abs(e) < 1e-5 || !d) break; t = Math.max(0, Math.min(1, t - e / d)); }
      return Y(t);
    };
  })(0.45, 0, 0.2, 1);

  // The way from y to t, less the dead stretches, as pieces in travel order.
  function route(y, t, dead) {
    var pieces = [[Math.min(y, t), Math.max(y, t)]];
    dead.forEach(function (d) {
      var out = [];
      pieces.forEach(function (p) {
        if (d[1] <= p[0] || d[0] >= p[1]) { out.push(p); return; }
        if (d[0] > p[0]) out.push([p[0], d[0]]);
        if (d[1] < p[1]) out.push([d[1], p[1]]);
      });
      pieces = out;
    });
    return t >= y ? pieces : pieces.reverse().map(function (p) { return [p[1], p[0]]; });
  }
  // v0: the speed (px per ms, along the way) the page is already moving at, from a released finger. Then the glide
  // starts at that speed and slows to rest (a cubic Hermite curve), so the hand-off has no jolt.
  function glide(y, t, dead, v0) {
    stop();
    var pieces = route(y, t, dead), len = 0;
    pieces.forEach(function (p) { len += Math.abs(p[1] - p[0]); });
    if (len < 1) { window.scrollTo(0, t); return; }
    var ms = Math.max(560, Math.min(1150, 480 + len * 0.6)), t0 = performance.now();
    var v = Math.max(0, Math.min(v0 || 0, 2.5 * len / ms));   // more would overshoot
    var curve = v ? function (k) { return len * (-2 * k * k * k + 3 * k * k) + ms * v * (k * k * k - 2 * k * k + k); }
                  : function (k) { return len * ease(k); };
    anim = { id: 0 };
    var frame = function (now) {
      if (!anim) return;
      var k = Math.min(1, (now - t0) / ms), u = curve(k), at = t;
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i], l = Math.abs(p[1] - p[0]);
        if (u <= l || i === pieces.length - 1) { at = p[0] + (p[1] > p[0] ? 1 : -1) * Math.min(u, l); break; }
        u -= l;
      }
      window.scrollTo(0, k < 1 ? at : t);   // fractions of a pixel: smoother on fine screens
      if (k < 1) { anim.id = requestAnimationFrame(frame); return; }
      anim = null;
      if (pending) { var d = pending > 0 ? 1 : -1; pending -= d; step(d); }
    };
    anim.id = requestAnimationFrame(frame);
  }
  function stop() { if (anim) { cancelAnimationFrame(anim.id); anim = null; } }
  // Steps asked for during a glide: up to two wait their turn; a turn the other way cancels them.
  function queue(dir) { pending = pending * dir < 0 ? dir : Math.max(-2, Math.min(2, pending + dir)); }

  // One step in a direction, from where the page is (or from where a swipe began).
  function step(dir, from, speed) {
    var L = lanes();
    if (L === null) return;   // a card is moving the page itself
    var y = from === undefined ? window.scrollY : from, t = nextStop(stops(L), y, dir);
    if (t === undefined) return;
    glide(window.scrollY, t, deadZones(L), speed);
  }
  function goTo(t) { var L = lanes(); if (L !== null) glide(window.scrollY, t, deadZones(L)); }

  /* ---------- wheel and trackpad: one gesture, one step ---------- */
  // A gesture is a stream of wheel events with no pause longer than QUIET: one click of a notched wheel, a quick roll
  // of several clicks, or a whole flick of a trackpad or free-spinning wheel, momentum and all. Its first push takes
  // one step; the rest of the stream is spent. (A free-spinning wheel or a trackpad's momentum rises and falls on its
  // own, so a rise inside a stream is not a new flick.) The one exception: once the glide is over and the stream's
  // tail has all but died away, a clear new push is a new flick. Separate clicks during a glide wait their turn.
  var QUIET = 220, lastWheel = 0, acc = 0, spent = false, recent = [];
  window.addEventListener('wheel', function (e) {
    if (off() || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    var now = performance.now(), d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh() : 1), abs = Math.abs(d);
    var gap = now - lastWheel, dying = recent.length >= 4 && Math.max.apply(null, recent) < 6;
    lastWheel = now; recent.push(abs); if (recent.length > 4) recent.shift();
    if (gap > QUIET || (!anim && dying && abs >= 30)) { acc = 0; spent = false; }
    if (spent) return;
    acc += d;
    if (Math.abs(acc) < 12) return;
    spent = true; acc = 0;
    var dir = d > 0 ? 1 : -1;
    if (anim) { queue(dir); return; }
    step(dir);
  }, { passive: false });

  /* ---------- keys ---------- */
  window.addEventListener('keydown', function (e) {
    if (off() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var el = e.target, tag = el && el.tagName, k = e.key, dir = 0;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
    if (k === ' ' && (tag === 'BUTTON' || tag === 'A')) return;   // Space presses the button
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) dir = 1;
    else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) dir = -1;
    else if (k === 'Home') { e.preventDefault(); goTo(0); return; }
    else if (k === 'End') { e.preventDefault(); goTo(maxY()); return; }
    if (!dir) return;
    e.preventDefault();
    if (anim) { queue(dir); return; }
    step(dir);
  });

  /* ---------- touch: follow the finger, then glide on or back ---------- */
  var tY = null, tFrom = 0, tMin = 0, tMax = 0, follow = true, trail = [];
  window.addEventListener('touchstart', function (e) {
    if (off() || e.touches.length !== 1) { tY = null; return; }
    stop(); pending = 0;
    tY = e.touches[0].clientY; tFrom = window.scrollY; trail = [[performance.now(), tY]];
    var L = lanes();
    follow = !!L && !L.rests.length;   // in an open flow a swipe steps; the finger does not drag the screens
    if (follow) {
      var S = stops(L), up = nextStop(S, tFrom, -1), down = nextStop(S, tFrom, 1);
      tMin = up === undefined ? tFrom : up; tMax = down === undefined ? tFrom : down;
    }
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (tY === null) return;
    if (e.touches.length !== 1) { tY = null; return; }   // a pinch: leave it to the browser
    e.preventDefault();
    var y = e.touches[0].clientY;
    trail.push([performance.now(), y]); if (trail.length > 6) trail.shift();
    if (follow) window.scrollTo(0, Math.max(tMin, Math.min(tMax, tFrom + (tY - y))));
  }, { passive: false });
  window.addEventListener('touchend', function () {
    if (tY === null) return;
    var last = trail[trail.length - 1], moved = tY - last[1], first = trail[0];
    for (var i = trail.length - 1; i >= 0 && last[0] - trail[i][0] <= 100; i--) first = trail[i];   // the release: its last 0.1 s
    var speed = (first[1] - last[1]) / Math.max(1, last[0] - first[0]);   // px per ms; + is towards the page's end
    tY = null;
    if (Math.abs(moved) < 6) return;   // a tap
    var dir = Math.abs(moved) > 0.1 * vh() || Math.abs(speed) > 0.25 ? (moved > 0 ? 1 : -1) : 0;
    if (dir) step(dir, tFrom, follow && speed * dir > 0 ? Math.abs(speed) : 0);   // the page is moving only if it was following
    else goTo(tFrom);
  }, { passive: true });
  window.addEventListener('touchcancel', function () { if (tY !== null) { tY = null; goTo(tFrom); } }, { passive: true });

  /* ---------- the chapter arc (desktop) ---------- */
  // A thin gold arc stands at the right edge, both ends on the edge, bowed a little into the page. A bolder glint on
  // it (the opening arc's own glint) marks where the reader is and moves with the page from chapter to chapter. Over
  // the arc the glint follows the pointer, the nearest chapter's name shows, and a click goes there. Each chapter also
  // has a button on the arc for the keyboard. Names: the chapter's heading, or for the two chapters without one, words
  // already on the page (the logo's name, the button's words). Hidden on phones and while a card's stage is open
  // (style.css); with Reduce Motion the glint and the page jump.
  function label(ch) {
    var h = ch.querySelector('h2'), logo = ch.querySelector('.logo'), btn = ch.querySelector('.btn');
    return h ? h.textContent.trim() : logo ? logo.alt : btn ? btn.textContent.trim() : '';
  }
  function toChapter(i) {
    var L = lanes(), out = [];
    if (L === null) return;
    chapterStops(chapters[i], out);
    var t = Math.round(Math.max(0, Math.min(maxY(), Math.min.apply(null, out))));
    pending = 0;
    if (mqRM.matches) { stop(); window.scrollTo(0, t); return; }
    glide(window.scrollY, t, deadZones(L));
  }
  // Where the page rests in each chapter (the place a click goes), for mapping the scroll onto the arc.
  function restOf(i) { var out = []; chapterStops(chapters[i], out); return Math.max(0, Math.min(maxY(), Math.min.apply(null, out))); }

  var SVGNS = 'http://www.w3.org/2000/svg', HALF = 196, PADV = 24, REACH = 46;   // half the arc's height; room above and below; room to its left
  var nav = document.createElement('nav'), svg = document.createElementNS(SVGNS, 'svg'), tag = document.createElement('span');
  nav.className = 'arcnav'; tag.className = 'arcnav-tag';
  var stopsEl = chapters.map(function (ch, i) {
    var b = document.createElement('button'), name = document.createElement('span');
    b.type = 'button'; b.className = 'arcnav-stop'; name.className = 'vh'; name.textContent = label(ch);
    b.appendChild(name);
    b.addEventListener('focus', function () { focusAt = i; show(i); aim(); });
    b.addEventListener('blur', function () { if (focusAt === i) { focusAt = -1; if (hoverAt === null) hide(); aim(); } });
    nav.appendChild(b);
    return b;
  });
  nav.insertBefore(svg, nav.firstChild);
  nav.appendChild(tag);
  (document.querySelector('main') || document.body).appendChild(nav);

  var G = {}, glintEl = null, hoverAt = null, focusAt = -1, theta = null, aimAt = 0, loop = 0;
  // Circle through both ends on the window's right edge and an apex bowed left by BOW.
  function build() {
    var bow = window.innerWidth >= 1280 ? 26 : 18, W = bow + REACH, h = HALF, R = (h * h + bow * bow) / (2 * bow);
    G = { W: W, H: 2 * (HALF + PADV), R: R, cx: W - bow + R, cy: PADV + h, max: Math.asin(h / R), bow: bow };
    G.span = 0.84 * G.max;
    var pt = function (a) { return [G.cx - R * Math.cos(a), G.cy + R * Math.sin(a)]; };
    var arc = function (a, b) { var p = pt(a), q = pt(b); return 'M ' + p[0] + ' ' + p[1] + ' A ' + R + ' ' + R + ' 0 0 0 ' + q[0] + ' ' + q[1]; };
    var g = 30 / R;   // the glint: 60 px of the arc
    nav.style.width = W + 'px'; nav.style.height = G.H + 'px';
    svg.setAttribute('width', W); svg.setAttribute('height', G.H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + G.H);
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    svg.innerHTML =
      '<defs><filter id="an-halo" x="-400%" y="-60%" width="900%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="an-glow" x="-400%" y="-60%" width="900%" height="220%"><feGaussianBlur stdDeviation="1.6"/></filter>' +
      '<linearGradient id="an-glint" gradientUnits="userSpaceOnUse" x1="0" y1="' + (G.cy - 30) + '" x2="0" y2="' + (G.cy + 30) + '">' +
      '<stop offset="0" stop-color="#f2cc52" stop-opacity="0"/><stop offset=".28" stop-color="#f2cc52" stop-opacity=".55"/>' +
      '<stop offset=".5" stop-color="#fff5c8" stop-opacity="1"/><stop offset=".72" stop-color="#f2cc52" stop-opacity=".55"/>' +
      '<stop offset="1" stop-color="#f2cc52" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="arcnav-line" d="' + arc(-G.max, G.max) + '"/>' +
      '<path class="arcnav-hit" d="' + arc(-G.max, G.max) + '"/>' +
      '<g class="arcnav-glint"><path d="' + arc(-g, g) + '" stroke="url(#an-glint)" stroke-width="16" stroke-opacity=".55" filter="url(#an-halo)"/>' +
      '<path d="' + arc(-g, g) + '" stroke="url(#an-glint)" stroke-width="6" stroke-opacity=".9" filter="url(#an-glow)"/>' +
      '<path d="' + arc(-g, g) + '" stroke="url(#an-glint)" stroke-width="2.6"/></g>';
    glintEl = svg.querySelector('.arcnav-glint');
    stopsEl.forEach(function (b, i) { var p = pt(at(i)); b.style.left = p[0] + 'px'; b.style.top = p[1] + 'px'; });
    G.pt = pt;
    if (theta !== null) draw();
  }
  function at(i) { return -G.span + 2 * G.span * i / (chapters.length - 1); }   // a chapter's place on the arc
  function nearest(a) { return Math.max(0, Math.min(chapters.length - 1, Math.round((a + G.span) / (2 * G.span) * (chapters.length - 1)))); }

  function show(i) {
    var p = G.pt(at(i));
    tag.textContent = label(chapters[i]);
    tag.style.right = (G.W - p[0] + 18) + 'px'; tag.style.top = p[1] + 'px';
    nav.classList.add('naming');
  }
  function hide() { nav.classList.remove('naming'); }

  // Where the glint should be: the pointer, a focused stop, or the page itself (between two chapters, in proportion).
  function target() {
    if (hoverAt !== null) return hoverAt;
    if (focusAt > -1) return at(focusAt);
    var y = window.scrollY, k = 0, n = chapters.length, rests = chapters.map(function (c, i) { return restOf(i); });
    while (k < n - 1 && y >= rests[k + 1]) k++;
    var f = k < n - 1 && rests[k + 1] > rests[k] ? Math.max(0, Math.min(1, (y - rests[k]) / (rests[k + 1] - rests[k]))) : 0;
    return at(k + f);
  }
  function draw() { glintEl.setAttribute('transform', 'rotate(' + (-theta * 180 / Math.PI) + ' ' + G.cx + ' ' + G.cy + ')'); }
  function aim() { aimAt = target(); if (!loop) loop = requestAnimationFrame(tick); }
  function tick() {
    loop = 0;
    if (theta === null || mqRM.matches) theta = aimAt;
    else theta += (aimAt - theta) * 0.2;
    if (Math.abs(aimAt - theta) < 1e-4) theta = aimAt;
    draw();
    if (lift && lift.svg.style.display === 'block') liftFrame();   // the lift's glint ends where this one is
    if (theta !== aimAt) loop = requestAnimationFrame(tick);
  }

  // The pointer: only the arc's strip and its stops take it (style.css), so the page beside it stays clickable.
  function angleOf(e) {
    var r = nav.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    return Math.max(-G.span, Math.min(G.span, Math.atan2(my - G.cy, G.cx - mx)));
  }
  nav.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    hoverAt = angleOf(e); show(nearest(hoverAt)); aim();
  });
  nav.addEventListener('pointerleave', function () { hoverAt = null; if (focusAt > -1) show(focusAt); else hide(); aim(); });
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('.arcnav-stop');
    var i = e.detail === 0 && b ? stopsEl.indexOf(b) : nearest(angleOf(e));   // a key press on a stop, or where the pointer is
    toChapter(i);
  });

  /* ---------- the opening's arc lifts into the chapter arc (desktop) ---------- */
  // Between the opening and the second chapter the scroll lifts the horizon's golden line and turns it into the arc at
  // the right edge: one arc whose chord (its middle, length and angle, 0 to 90 degrees, the bulge turning from up to
  // left) and bow follow the scroll, as do its stroke (the horizon's deeper line becomes the side arc's) and its glint
  // (from wherever the horizon's glint is sliding to the chapter arc's own). The horizon's soft halo and glow stay where
  // they are and fade as the line lifts away: fading a still layer is nearly free, where re-blurring a moving one every
  // frame stutters (Safari draws SVG blurs on the CPU). At either end the line lies exactly on the real one, which takes
  // over: the horizon at the top, the chapter arc from the second chapter on.
  // Not on phones (no chapter arc there) or under Reduce Motion (the chapter arc simply appears with the second chapter).
  var sky = document.querySelector('.ch-open .firmament'), skyGlint = sky && sky.querySelector('.glint');
  var lift = null, rest1 = 1, skyAt = 0;
  function morphing() { return !!sky && mqWide.matches && !mqRM.matches; }
  function measure() { rest1 = Math.max(1, Math.round(restOf(1))); }   // rounded, as the glide's own target is
  function el(name, attrs) { var e = document.createElementNS(SVGNS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function makeLift() {
    lift = { svg: el('svg', { class: 'arclift', 'aria-hidden': 'true', focusable: 'false' }) };
    var defs = el('defs', {});
    ['ghalo', 'gglow'].forEach(function (n) {
      var f = el('filter', { id: 'al-' + n, filterUnits: 'userSpaceOnUse' }), b = el('feGaussianBlur', { stdDeviation: 1 });
      f.appendChild(b); defs.appendChild(f); lift[n + 'F'] = f; lift[n + 'B'] = b;
    });
    var gr = el('linearGradient', { id: 'al-glint', gradientUnits: 'userSpaceOnUse' });
    [[0, 0], [0.28, 0.55], [0.5, 1], [0.72, 0.55], [1, 0]].forEach(function (st) {
      gr.appendChild(el('stop', { offset: st[0], 'stop-color': st[0] === 0.5 ? '#fff5c8' : '#f2cc52', 'stop-opacity': st[1] }));
    });
    defs.appendChild(gr); lift.grad = gr; lift.svg.appendChild(defs);
    lift.line = el('path', {});
    lift.gh = el('path', { class: 'g', stroke: 'url(#al-glint)', filter: 'url(#al-ghalo)' });
    lift.gg = el('path', { class: 'g', stroke: 'url(#al-glint)', filter: 'url(#al-gglow)' });
    lift.gc = el('path', { class: 'g', stroke: 'url(#al-glint)' });
    ['line', 'gh', 'gg', 'gc'].forEach(function (k) { lift.svg.appendChild(lift[k]); });
    document.body.appendChild(lift.svg);
  }
  function mix(a, b, t) { return a + (b - a) * t; }
  function ramp(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }
  function seg(C, R, n, d, a, b) {   // the stretch of the circle between angles a and b (from the apex, b nearer the chord's B end)
    var P = function (t) { return [C[0] + R * (n[0] * Math.cos(t) - d[0] * Math.sin(t)), C[1] + R * (n[1] * Math.cos(t) - d[1] * Math.sin(t))]; };
    var p = P(a), q = P(b);
    return { d: 'M ' + p[0] + ' ' + p[1] + ' A ' + R + ' ' + R + ' 0 0 1 ' + q[0] + ' ' + q[1], p: p, q: q };
  }
  function liftFrame() {
    var on = morphing(), y = window.scrollY, p = y >= rest1 - 0.5 ? 1 : on ? Math.max(0, y / rest1) : 0;
    if (sky) {   // the horizon keeps its halo and glow, fading; its line and glint are lifted
      sky.classList.toggle('is-lifting', on && p > 0);
      sky.style.opacity = on && p > 0 ? 1 - ramp(0, 0.35, p) : '';
    }
    if (!on || p <= 0 || p >= 1) { if (lift) lift.svg.style.display = 'none'; return; }
    if (!lift) makeLift();
    // The horizon as it sits on screen now (viewBox 0 0 1600 220, xMidYMax slice; circle (800, 1700), r 1600).
    var r = sky.getBoundingClientRect(), k = Math.max(r.width / 1600, r.height / 220);
    var R0 = 1600 * k, cy0 = r.top + r.height - 220 * k + 1700 * k, half0 = r.width / 2, end0 = cy0 - Math.sqrt(R0 * R0 - half0 * half0);
    // Where the horizon's glint is sliding right now (it keeps going while the lift is out), so either end matches.
    var m = skyGlint ? getComputedStyle(skyGlint).transform : 'none', v = m.match(/matrix\(([^,]+),\s*([^,]+)/);
    skyAt = v ? Math.atan2(+v[2], +v[1]) : 0;
    // And the chapter arc: ends on the right edge, HALF above and below the middle of the window, bowed G.bow.
    var W = document.documentElement.clientWidth, H = document.documentElement.clientHeight;
    // It draws in first (length and bow, mostly in the first half), then turns (mostly in the second), so its ends
    // never swing on a long arm; the middle travels with the page.
    var t = ramp(0, 1, p), draw_in = ramp(0, 0.6, p), turn = ramp(0.2, 1, p);   // eased into both ends, so each hand-off is exact
    var mx = mix(r.left + half0, W, t), my = mix(end0, H / 2, t), L = mix(half0, HALF, draw_in), bow = mix(R0 - (cy0 - end0), G.bow, draw_in);
    var a = -Math.PI / 2 * turn, d = [Math.cos(a), Math.sin(a)], n = [d[1], -d[0]];
    var R = (L * L + bow * bow) / (2 * bow), C = [mx - n[0] * (R - bow), my - n[1] * (R - bow)], ends = Math.asin(Math.min(1, L / R));
    var arc = seg(C, R, n, d, ends, -ends).d;
    // The glint, by distance along the arc from its apex: from the horizon's to the chapter arc's own place.
    var s = mix(-skyAt * R0, G.R * (theta === null ? at(1) : theta), t), g = mix(0.0625 * R0, 30, t), gl = seg(C, R, n, d, (s + g) / R, (s - g) / R);
    lift.svg.setAttribute('width', W); lift.svg.setAttribute('height', H); lift.svg.style.display = 'block';
    // The glint's blurs only as wide as its strokes need: a whole-window filter region would be redrawn every frame.
    var gm = seg(C, R, n, d, s / R, s / R).p;
    box(lift.ghaloF, [gl.p, gl.q, gm], 40); box(lift.gglowF, [gl.p, gl.q, gm], 14);
    lift.ghaloB.setAttribute('stdDeviation', mix(0.01, 6, t)); lift.gglowB.setAttribute('stdDeviation', 1.6);
    set(lift.line, arc, mix(1.5 * k, 1.5, t), mix(1, 0.75, t));
    lift.line.setAttribute('stroke', 'rgb(' + Math.round(mix(176, 214, t)) + ',' + Math.round(mix(138, 186, t)) + ',' + Math.round(mix(52, 107, t)) + ')');
    lift.grad.setAttribute('x1', gl.p[0]); lift.grad.setAttribute('y1', gl.p[1]); lift.grad.setAttribute('x2', gl.q[0]); lift.grad.setAttribute('y2', gl.q[1]);
    set(lift.gh, gl.d, mix(5 * k, 16, t), mix(0.25, 0.55, t));
    set(lift.gg, gl.d, mix(1.8 * k, 6, t), mix(0, 0.9, t));
    set(lift.gc, gl.d, mix(1.8 * k, 2.6, t), 1);
  }
  function set(e, path, w, o) { e.style.display = o < 0.005 ? 'none' : ''; e.setAttribute('d', path); e.setAttribute('stroke-width', w); e.setAttribute('stroke-opacity', o); }
  function box(f, pts, m) {
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
    var x = Math.min.apply(null, xs) - m, y = Math.min.apply(null, ys) - m;
    f.setAttribute('x', x); f.setAttribute('y', y);
    f.setAttribute('width', Math.max.apply(null, xs) + m - x); f.setAttribute('height', Math.max.apply(null, ys) + m - y);
  }
  // The hand-off is instant (the two lie on each other), so neither fades.
  function setAway(on) {
    if (nav.classList.contains('is-away') === on) return;
    nav.style.transition = 'none';
    nav.classList.toggle('is-away', on);
    void nav.offsetWidth;
    requestAnimationFrame(function () { nav.style.transition = ''; });
  }

  var current = -1, marking = 0;
  function mark() {
    marking = 0;
    var mid = window.scrollY + vh() / 2, here = 0;
    chapters.forEach(function (ch, i) { if (docTop(ch) <= mid) here = i; });
    aim();
    liftFrame();
    // Not on the opening chapter: on desktop it appears as the horizon's arc arrives in its place, otherwise with the second.
    setAway(morphing() ? window.scrollY < rest1 - 0.5 : here === 0);
    if (here === current) return;
    current = here;
    stopsEl.forEach(function (b, i) { if (i === here) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!marking) marking = requestAnimationFrame(mark); }, { passive: true });
  window.addEventListener('resize', function () { build(); measure(); mark(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); mark(); });
  window.addEventListener('load', function () { measure(); mark(); });
  build();
  measure();
  mark();
})();
