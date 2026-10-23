/* scroll-settle.js — the home page's chapters settle, top and bottom, when a scroll comes to rest.
   When the reader stops, the page glides (an ease in and out, a little under half a second) to the nearest place it
   rests, in the direction they were going: a little down settles forward, a little back up settles back.
     - Every chapter rests at its top and, if it is taller than the screen, at its bottom. A chapter much taller
       than the screen ("Our first app" on phones) is free in between, so nothing in it is out of reach.
     - With a flow open, it rests on each whole screen (the places come from cards.js).
   Off under Reduce Motion and without JavaScript; any wheel, touch, key or click takes over at once. */
(function () {
  var chapters = [].slice.call(document.querySelectorAll('.home .ch, .home .ch-app'));
  if (!chapters.length || !window.requestAnimationFrame) return;
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');

  var NUDGE = 0.03;   // a move smaller than this (share of the screen) goes back where it came from
  var EDGE = 0.25;    // in a free chapter, how near an end (share of the screen) still settles onto it
  var from = window.scrollY, idle = 0, glide = null, input = false;   // from: where the page last came to rest

  function vh() { return window.innerHeight; }
  function maxY() { return document.documentElement.scrollHeight - vh(); }
  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  // The places the page can rest, and the stretches where it may rest anywhere.
  function places(rests) {
    var V = vh(), stops = [], free = [];
    chapters.forEach(function (ch) {
      var top = Math.round(docTop(ch)), end = Math.round(top + ch.offsetHeight - V);
      stops.push(top);
      if (end > top + 2) stops.push(end);
      if (end - top > 0.6 * V) free.push([top + EDGE * V, end - EDGE * V]);
    });
    stops.push(maxY());
    if (rests && rests.length) {   // a flow is open: inside its stretch, only its own places
      var a = rests[0], b = rests[rests.length - 1];
      stops = stops.filter(function (y) { return y < a || y > b; }).concat(rests);
      free = free.reduce(function (out, f) {
        if (f[1] <= a || f[0] >= b) out.push(f);
        else { if (f[0] < a) out.push([f[0], a]); if (f[1] > b) out.push([b, f[1]]); }
        return out;
      }, []);
    }
    var M = maxY();
    stops = stops.map(function (y) { return Math.max(0, Math.min(M, y)); }).sort(function (x, y) { return x - y; });
    return { stops: stops, free: free };
  }

  // Where to rest, from where the scroll began (y0) and where it stopped (y).
  function target(y0, y) {
    var rests = window.prothesisCardRests ? window.prothesisCardRests() : [];
    if (rests === null) return null;                       // a card is moving the page itself
    var P = places(rests), V = vh(), dir = y > y0 + 1 ? 1 : y < y0 - 1 ? -1 : 0;
    if (P.free.some(function (f) { return y > f[0] && y < f[1]; })) return null;
    var prev = -Infinity, next = Infinity;
    P.stops.forEach(function (s) { if (s <= y && s > prev) prev = s; if (s >= y && s < next) next = s; });
    // Heading into a free stretch: let it be.
    var freeAhead = P.free.some(function (f) { return dir > 0 ? f[0] >= y && f[0] < next : f[1] <= y && f[1] > prev; });
    if (freeAhead) return null;
    if (prev === -Infinity) return next;
    if (next === Infinity) return prev;
    if (dir > 0) return y - prev <= NUDGE * V ? prev : next;
    if (dir < 0) return next - y <= NUDGE * V ? next : prev;
    return y - prev <= next - y ? prev : next;
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // cubic in-out
  function glideTo(y) {
    var y0 = window.scrollY, d = y - y0;
    if (Math.abs(d) < 2) return;
    var ms = Math.min(560, 240 + Math.abs(d) * 0.45), t0 = performance.now();
    glide = { id: 0 };
    var step = function (t) {
      if (!glide) return;
      var k = Math.min(1, (t - t0) / ms);
      window.scrollTo(0, Math.round(y0 + d * ease(k)));
      if (k < 1) glide.id = requestAnimationFrame(step);
      else { glide = null; from = window.scrollY; }
    };
    glide.id = requestAnimationFrame(step);
  }
  function stop() { if (glide) { cancelAnimationFrame(glide.id); glide = null; from = window.scrollY; } }

  function settle() {
    idle = 0;
    var y = window.scrollY;
    if (glide || !input || mqRM.matches) { from = y; return; }
    input = false;
    var t = target(from, y);
    from = y;
    if (t !== null && t !== undefined) glideTo(t);
  }

  // The reader's own scrolling: settle once it has stopped (momentum included). Where it began is where the page last
  // rested; the scroll position at the wheel event itself can't be trusted, as the browser may have scrolled already.
  var KEYS = /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      stop();
      if (ev === 'keydown' && !KEYS.test(e.key)) return;   // Tab and the rest move focus, not the page
      input = true;
    }, { passive: true });
  });
  window.addEventListener('touchend', function () { input = true; }, { passive: true });
  window.addEventListener('scroll', function () {
    if (glide) return;
    if (idle) clearTimeout(idle);
    idle = setTimeout(settle, 140);
  }, { passive: true });
  if ('onscrollend' in window) window.addEventListener('scrollend', function () { if (!glide) { if (idle) clearTimeout(idle); settle(); } });
})();
