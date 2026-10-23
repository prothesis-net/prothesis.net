/* scroll-settle.js — the home page moves chapter by chapter, kept in its lanes.
   Each flick of the wheel or trackpad, each swipe, each scrolling key is read as an intent, and the page glides on its
   own (a smooth ease, about two thirds of a second for a whole screen) to the next place it rests in that direction.
   At rest one chapter fills the screen; the next is never half in view.
     - A chapter rests at its top; one taller than the screen also at its bottom (more steps if it is much taller), so
       nothing is out of reach and no step is longer than a screen.
     - "Our first app": its top, then (on phones) each card in the middle of the screen, then its bottom.
     - With a flow open, each flick is one screen; the glide skips the stretches of scroll where nothing on screen
       changes (the places come from cards.js), so the change is all there is to see.
   On phones the page follows the finger, then glides on (or back) on release. Off under Reduce Motion, when the page
   is pinch-zoomed, and without JavaScript; the scroll bar still scrolls freely. */
(function () {
  var chapters = [].slice.call(document.querySelectorAll('.home .ch, .home .ch-app'));
  if (!chapters.length || !window.requestAnimationFrame) return;
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqWide = window.matchMedia('(min-width: 1024px)');

  var STEP = 0.85;   // the longest step inside a tall chapter, as a share of the screen
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
      if (!mqWide.matches) [].forEach.call(ch.querySelectorAll('.card'), function (c) {
        pts.push(docTop(c) + c.offsetHeight / 2 - V / 2);
      });
      pts.push(end);
      pts = pts.filter(function (p) { return p >= top && p <= end; }).sort(byNum);
      // A card already whole at the previous stop needs no step of its own.
      pts = pts.reduce(function (keep, p) {
        if (p - keep[keep.length - 1] >= 0.3 * V) keep.push(p);
        else if (p === end) keep[keep.length - 1] = Math.max(keep[keep.length - 1], p);
        return keep;
      }, [pts[0]]);
      for (var i = 0; i < pts.length - 1; i++) fill(pts[i], pts[i + 1], out);
      return;
    }
    // A chapter whose words all show from its top is one stop: the rest of it is margin.
    var inner = ch.querySelector('.inner');
    if (inner && inner.getBoundingClientRect().bottom + window.scrollY <= top + V - 8) { out.push(top); return; }
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
  // cubic-bezier(.4, 0, .2, 1): a soft start that answers at once, and a long, gentle landing.
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
  })(0.4, 0, 0.2, 1);

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
  function glide(y, t, dead) {
    stop();
    var pieces = route(y, t, dead), len = 0;
    pieces.forEach(function (p) { len += Math.abs(p[1] - p[0]); });
    if (len < 1) { window.scrollTo(0, t); return; }
    var ms = Math.max(420, Math.min(880, 380 + len * 0.38)), t0 = performance.now();
    anim = { id: 0 };
    var frame = function (now) {
      if (!anim) return;
      var k = Math.min(1, (now - t0) / ms), u = ease(k) * len, at = t;
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i], l = Math.abs(p[1] - p[0]);
        if (u <= l || i === pieces.length - 1) { at = p[0] + (p[1] > p[0] ? 1 : -1) * Math.min(u, l); break; }
        u -= l;
      }
      window.scrollTo(0, Math.round(k < 1 ? at : t));
      if (k < 1) { anim.id = requestAnimationFrame(frame); return; }
      anim = null;
      if (pending) { var d = pending; pending = 0; step(d); }
    };
    anim.id = requestAnimationFrame(frame);
  }
  function stop() { if (anim) { cancelAnimationFrame(anim.id); anim = null; } }

  // One step in a direction, from where the page is (or from where a swipe began).
  function step(dir, from) {
    var L = lanes();
    if (L === null) return;   // a card is moving the page itself
    var y = from === undefined ? window.scrollY : from, t = nextStop(stops(L), y, dir);
    if (t === undefined) return;
    glide(window.scrollY, t, deadZones(L));
  }
  function goTo(t) { var L = lanes(); if (L !== null) glide(window.scrollY, t, deadZones(L)); }

  /* ---------- wheel and trackpad: one flick, one step ---------- */
  var lastWheel = 0, lastAbs = 0, acc = 0, spent = false;
  window.addEventListener('wheel', function (e) {
    if (off() || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    var now = performance.now(), d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh() : 1), abs = Math.abs(d);
    // A new flick: after a pause, or a sudden surge over the fading tail of the last one (trackpad momentum).
    var fresh = now - lastWheel > 160 || (abs > lastAbs * 1.6 && abs > 18);
    lastWheel = now; lastAbs = abs;
    if (fresh) { acc = 0; spent = false; }
    if (spent) return;
    acc += d;
    if (Math.abs(acc) < 12) return;
    spent = true; acc = 0;
    var dir = d > 0 ? 1 : -1;
    if (anim) { pending = dir; return; }
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
    if (anim) { pending = dir; return; }
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
    if (dir) step(dir, tFrom);
    else goTo(tFrom);
  }, { passive: true });
  window.addEventListener('touchcancel', function () { if (tY !== null) { tY = null; goTo(tFrom); } }, { passive: true });
})();
