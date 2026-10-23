/* screen-dates.js — the dates inside the app's screenshots show the reader's own today.
   Each screenshot that shows a date ("Thursday, October 22", "Thu 10-22", "held since Oct 22, 2026") is redrawn in
   the browser: the old date is smoothed away by blending the background from either side, row by row, and today's
   date is set in its place in the app's own face (Prothesis Basic), size, colour and light edge. The image files are
   never changed; without JavaScript, or if anything fails, the original screenshots show as they are.
   Work is done only when it is needed: the cards' first screens as the section comes near, the rest of a flow when
   its card is pointed at or opened. If the day turns while the page is open, the dates follow on return. */
(function () {
  var wrap = document.querySelector('[data-cards]');
  if (!wrap || !window.Promise || !window.URL || !document.createElement('canvas').getContext) return;

  var DIR = '/assets/img/app/';
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var SAY = {
    long:  function (d) { return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); },
    short: function (d) { return DAYS[d.getDay()].slice(0, 3) + ' ' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    held:  function (d) { return 'held since ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  };

  // Where each date sits (screenshot pixels, 780 × 1688), fitted against the originals: the box to clear, the plain
  // background strips to its left and right (x from–to, same rows), and how the app set the words.
  var SPOT = {
    morning: { say: 'long', box: [252, 296, 528, 337], L: [200, 240], R: [540, 580],
      weight: 400, size: 28, align: 'center', x: 390, base: 326, color: '#596B77', stroke: 0.2, hiA: 0.7, hiY: 2 },
    ponder: { say: 'short', box: [327, 303, 452, 335], L: [290, 322], R: [456, 490],
      weight: 700, size: 26, align: 'center', x: 389.5, base: 329.5, color: '#5B6D79', stroke: 0, hiA: 0.3, hiY: 3 },
    held: { say: 'held', box: [240, 355, 596, 400], L: [224, 238], R: [600, 650],
      weight: 400, size: 33.9, align: 'left', x: 245.25, base: 390, color: '#596B77', stroke: 0.2, hiA: 0.6, hiY: 2 },
    recollect: { say: 'short', box: [330, 821, 450, 853], L: [290, 325], R: [455, 490],
      weight: 400, size: 26, align: 'center', x: 390, base: 847.5, color: '#617280', stroke: 0.1, hiA: 0.5, hiY: 2 },
    turning: { say: 'short', box: [293, 538, 413, 569], L: [255, 288], R: [418, 450],
      weight: 400, size: 26.1, align: 'center', x: 353.5, base: 563.5, color: '#5E6F7A', stroke: 0.1, hiA: 0.35, hiY: 3 }
  };
  var SHOTS = {
    'morning-01': 'morning', 'day-01': 'ponder', 'day-02': 'ponder',
    'bible-05': 'held', 'bible-06': 'held', 'bible-07': 'held', 'bible-08': 'held',
    'evening-01': 'recollect', 'evening-02': 'turning', 'evening-03': 'turning', 'evening-04': 'turning', 'evening-05': 'turning'
  };
  var FIRST = ['morning-01', 'day-01', 'evening-01'];   // the cards' faces

  var today = key(new Date());
  var made = {};   // name → { day, url, promise }

  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function loadImage(src) {
    return new Promise(function (ok, fail) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = fail; im.src = src; });
  }
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([document.fonts.load('400 28px "Prothesis Basic"'), document.fonts.load('700 28px "Prothesis Basic"')]);
  }

  // Blend, per row, from the mean of the left strip to the mean of the right strip across the box.
  function clear(ctx, s) {
    var x0 = s.box[0], y0 = s.box[1], w = s.box[2] - x0, h = s.box[3] - y0;
    var img = ctx.getImageData(x0, y0, w, h), d = img.data;
    var left = ctx.getImageData(s.L[0], y0, s.L[1] - s.L[0], h).data, lw = s.L[1] - s.L[0];
    var right = ctx.getImageData(s.R[0], y0, s.R[1] - s.R[0], h).data, rw = s.R[1] - s.R[0];
    for (var y = 0; y < h; y++) {
      var l = mean(left, y, lw), r = mean(right, y, rw);
      for (var x = 0; x < w; x++) {
        var t = w > 1 ? x / (w - 1) : 0, i = (y * w + x) * 4;
        d[i] = l[0] + (r[0] - l[0]) * t; d[i + 1] = l[1] + (r[1] - l[1]) * t; d[i + 2] = l[2] + (r[2] - l[2]) * t; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, x0, y0);
  }
  function mean(px, row, w) {
    var a = [0, 0, 0];
    for (var x = 0; x < w; x++) { var i = (row * w + x) * 4; a[0] += px[i]; a[1] += px[i + 1]; a[2] += px[i + 2]; }
    return [a[0] / w, a[1] / w, a[2] / w];
  }
  // The app's light edge first (a soft white copy just below), then the words.
  function write(ctx, s, text) {
    ctx.save();
    ctx.font = s.weight + ' ' + s.size + 'px "Prothesis Basic"';
    ctx.textAlign = s.align; ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = s.hiA; ctx.fillStyle = '#FFFFFF';
    if ('filter' in ctx) ctx.filter = 'blur(0.6px)';
    ctx.fillText(text, s.x, s.base + s.hiY);
    if ('filter' in ctx) ctx.filter = 'none';
    ctx.globalAlpha = 1; ctx.fillStyle = s.color;
    ctx.fillText(text, s.x, s.base);
    if (s.stroke) { ctx.strokeStyle = s.color; ctx.lineWidth = s.stroke; ctx.lineJoin = 'round'; ctx.strokeText(text, s.x, s.base); }
    ctx.restore();
  }

  function render(name, day) {
    var s = SPOT[SHOTS[name]];
    return Promise.all([loadImage(DIR + name + '.webp'), fontsReady()]).then(function (r) {
      var im = r[0], c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      var ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(im, 0, 0);
      clear(ctx, s);
      write(ctx, s, SAY[s.say](day));
      return new Promise(function (ok, fail) {
        c.toBlob(function (b) { if (b) ok(URL.createObjectURL(b)); else fail(new Error('no blob')); }, 'image/webp', 0.92);
      });
    });
  }

  // Every <img> showing this screenshot, now or later (cards.js copies the src of the hidden lists when a card opens).
  function swap(name, url, oldUrl) {
    var orig = DIR + name + '.webp';
    [].forEach.call(document.querySelectorAll('img'), function (im) {
      var src = im.getAttribute('src');
      if (src === orig || (oldUrl && src === oldUrl)) im.setAttribute('src', url);
    });
  }

  function date(name) {
    var have = made[name];
    if (have && have.day === today) return have.promise;
    var day = new Date(), k = key(day), old = have && have.url;
    var job = { day: k, url: null };
    job.promise = render(name, day).then(function (url) {
      if (made[name] !== job) { URL.revokeObjectURL(url); return; }   // overtaken by a newer day
      job.url = url; swap(name, url, old);
      if (old) URL.revokeObjectURL(old);
    }).catch(function () { if (made[name] === job) delete made[name]; });   // leave the original screenshot
    made[name] = job;
    return job.promise;
  }
  function dateAll(names) { names.forEach(function (n) { if (SHOTS[n]) date(n); }); }
  function flowOf(card) {
    return [].map.call(card.querySelectorAll('.flow img'), function (im) {
      var m = /([a-z]+-\d\d)\.webp$/.exec(im.getAttribute('src') || '');
      return m ? m[1] : (Object.keys(made).filter(function (n) { return made[n].url === im.getAttribute('src'); })[0] || '');
    });
  }

  // The faces as the section comes near; a flow's other screens when its card is pointed at, focused or opened.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); dateAll(FIRST); }
    }, { rootMargin: '1200px 0px' });
    io.observe(wrap);
  } else {
    dateAll(FIRST);
  }
  [].forEach.call(wrap.querySelectorAll('.card'), function (card) {
    var go = function () { dateAll(flowOf(card)); };
    ['pointerenter', 'focusin', 'touchstart'].forEach(function (ev) { card.addEventListener(ev, go, { passive: true }); });
    card.addEventListener('click', go, true);
  });

  // A new day while the page stays open: redraw what was drawn, when the reader comes back to it.
  function recheck() {
    var k = key(new Date());
    if (k === today) return;
    today = k;
    dateAll(Object.keys(made));
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) recheck(); });
  window.addEventListener('focus', recheck);
  window.addEventListener('pageshow', recheck);
})();
