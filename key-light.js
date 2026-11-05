/* key-light.js — the Key of David behind "What presses hardest" and "Could there be hope".
   One painting, never shown twice (style.css, .key-run). "What presses hardest" rests on the upper swirl, the
   painting's light glowing at the bottom of the screen. From there to "Could there be hope" the view moves down the
   same painting until the boy with his hand out is in view, the painting's own light now round his hand. Progress p runs 0 → 1 from the last rest of "What presses hardest" to
   "Could there be hope" at rest. The words keep the page's quick glide (scroll-settle.js), but the painting follows
   more slowly, on desktop and phones alike, easing after
   the scroll and settling about one second after it begins (Albert, 5 Nov 2026: the artwork should change slowly).
   All places are in the original painting's pixels (3728 × 5363). Each device has one tall blurred copy of part of it
   (bg-key-run-*.jpg) and two framings: "What presses hardest" (the old still crop) and "Could there be hope". */
(function () {
  var run = document.querySelector('.key-run');
  if (!run || !window.requestAnimationFrame) return;
  var stage = run.querySelector('.key-stage'), canvas = run.querySelector('.key-canvas');
  var presses = run.querySelector('.ch-presses'), hope = run.querySelector('.ch-hope');
  var mqPhone = window.matchMedia('(max-aspect-ratio: 4/5)');
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var W0 = 7.0;   // the painting follows like a soft spring (no overshoot): slow to start, settled by ~1 s,
                  // so it never rushes with the quick glide of the words (Albert, 5 Nov 2026: 1 s)

  // img: the part of the painting in the file [x, y, w, h]; px: the file's width in pixels.
  // from / to: the two framings [x, y, w, h, where extra height is cropped (0 top … 1 bottom)].
  var SET = {
    desk:  { img: [0, 0, 3720, 3288], px: 1920,
             from: [0, 0, 3720, 2328, .5],    to: [0, 960, 3720, 2328, .6]},
    phone: { img: [864, 0, 1800, 3904], px: 1350,
             from: [1075, 0, 1050, 2275, .5], to: [864, 0, 1800, 3904, .58]}
  };

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  var set, queued = false, shown = null, vel = 0, lastT = 0;
  function fit() {
    set = mqPhone.matches ? SET.phone : SET.desk;
    var k = set.px / set.img[2];   // file pixels per painting pixel
    canvas.style.width = set.px + 'px';
    canvas.style.height = Math.round(set.img[3] * k) + 'px';
    shown = null; vel = 0;   // a new size or device: place the painting at once
    update();
  }
  function update(now) {
    queued = false;
    now = now || performance.now();
    var W = stage.clientWidth, H = stage.clientHeight;
    var a = docTop(presses) + presses.offsetHeight - window.innerHeight, b = docTop(hope);
    var p = clamp((window.scrollY - a) / Math.max(1, b - a)), target = ease(p), e;
    if (shown === null || mqRM.matches) e = target;
    else {
      var dt = Math.min(.05, (now - lastT) / 1000);
      vel += (W0 * W0 * (target - shown) - 2 * W0 * vel) * dt;   // critically damped spring
      e = shown + vel * dt;
    }
    if (Math.abs(target - e) < .0005 && Math.abs(vel) < .002) { e = target; vel = 0; }
    shown = e; lastT = now;
    var f = set.from, t = set.to;
    var fx = mix(f[0], t[0], e), fy = mix(f[1], t[1], e), fw = mix(f[2], t[2], e), fh = mix(f[3], t[3], e), fp = mix(f[4], t[4], e);
    var S = Math.max(W / fw, H / fh);                    // screen pixels per painting pixel (cover)
    var ox = (W - fw * S) / 2 - (fx - set.img[0]) * S;   // where the file's top-left lands on screen
    var oy = (H - fh * S) * fp - (fy - set.img[1]) * S;
    var k = set.px / set.img[2];
    canvas.style.transform = 'translate(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px) scale(' + (S / k).toFixed(5) + ')';

    var st = run.style;
    st.setProperty('--p', p.toFixed(4));
    if (e !== target) queue();   // still easing toward where the scroll is
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

  run.classList.add('is-lit');
  fit();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', fit);
  if (mqPhone.addEventListener) mqPhone.addEventListener('change', fit);
  window.addEventListener('load', fit);
})();
