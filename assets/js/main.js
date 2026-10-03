(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var WA = '5514997211734';
  var MAIL = 'gabrielcarmelin@gpcrepresentacoes.com';

  if (!hasGsap || reduced) root.classList.add('no-anim');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Header, menu, nav ---------- */
  var hdr = $('.hdr');
  var menu = $('#menu');
  var burger = $('.burger');

  function onScroll() {
    hdr.classList.toggle('is-stuck', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.matchMedia('(min-width:1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(function (s) { navIO.observe(s); });
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- Mobile dock ---------- */
  var dock = $('.dock');
  var contato = $('#contato');
  function updateDock() {
    var cr = contato.getBoundingClientRect();
    var inContact = cr.top < window.innerHeight * 0.7;
    dock.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.6 && !inContact);
  }
  window.addEventListener('scroll', updateDock, { passive: true });
  updateDock();

  /* ---------- Footer year ---------- */
  var yr = $('#ano'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Hero: campo de células (a espuma cede e volta) ---------- */
  (function cells() {
    var hero = $('.hero');
    var cv = $('#cells');
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, gap = 34, dots = [], running = false, raf = 0;
    var ptr = { x: -999, y: -999, down: false, last: -99999, active: false };
    var t0 = performance.now(), introT = reduced ? 1 : 0;
    var LIME = [166, 232, 52], ORG = [255, 106, 19];

    function build() {
      var r = hero.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 720 ? 24 : W < 1100 ? 30 : 34;
      var rowH = gap * 0.866, rows = Math.ceil(H / rowH) + 1, cols = Math.ceil(W / gap) + 2;
      dots = [];
      var cx = W * 0.72, cy = H * 0.45, maxD = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      for (var j = 0; j < rows; j++) {
        for (var i = -1; i < cols; i++) {
          var x = i * gap + (j % 2 ? gap / 2 : 0), y = j * rowH;
          dots.push({ x: x, y: y, c: 0, v: 0, d: Math.hypot(x - cx, y - cy) / maxD });
        }
      }
    }

    function sstep(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    function backOut(x) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

    function frame(now) {
      raf = 0;
      var t = now - t0;
      if (introT < 1) introT = Math.min(1, t / 2200);
      var idle = now - ptr.last > 2600;
      var px = ptr.x, py = ptr.y, pR = ptr.down ? 190 : 130, pS = 1;
      if (idle || !ptr.active) {
        px = W * (0.66 + 0.26 * Math.sin(t * 0.00042));
        py = H * (0.46 + 0.24 * Math.sin(t * 0.00068 + 1.2));
        pR = 118; pS = 0.85;
      }
      ctx.clearRect(0, 0, W, H);
      var mobile = W < 720;
      var ph = t * 0.0006;

      for (var k = 0; k < dots.length; k++) {
        var d = dots[k], nx = d.x / W, ny = d.y / H;
        var dx = d.x - px, dy = d.y - py, dist = Math.hypot(dx, dy);
        var target = dist < pR ? Math.pow(1 - dist / pR, 1.6) * pS : 0;
        if (!reduced) {
          var stiff = target > d.c;
          var kk = stiff ? 0.32 : 0.05, dm = stiff ? 0.52 : 0.115;
          d.v += (target - d.c) * kk - d.v * dm;
          d.c += d.v;
        } else { d.c = 0; }

        /* fitas de pontos (eco das curvas do logo) */
        var y1 = H * (0.36 + 0.13 * Math.sin(nx * 5.1 + ph));
        var y2 = H * (0.70 + 0.10 * Math.sin(nx * 4.2 - ph * 0.85 + 2.1));
        var w = H * 0.075;
        var b1 = Math.exp(-Math.pow((d.y - y1) / w, 2));
        var b2 = Math.exp(-Math.pow((d.y - y2) / (w * 0.9), 2));
        var taper1 = 0.35 + 0.65 * sstep(0.1, 0.95, nx);
        var taper2 = 0.35 + 0.65 * (1 - sstep(0.15, 0.95, nx));
        var band1 = b1 * taper1, band2 = b2 * taper2;
        var side = mobile ? 0.5 : 0.22 + 0.78 * sstep(0.3, 0.78, nx);

        var vis = introT >= 1 ? 1 : backOut(Math.min(1, Math.max(0, introT * 1.7 - d.d * 0.7)));
        if (vis <= 0.001) continue;

        var base = 1.35 + band1 * (mobile ? 3.4 : 4.6) * taper1 + band2 * (mobile ? 2.2 : 3.0);
        var r = base * (1 - 0.78 * d.c) * vis;
        if (r < 0.2) continue;
        var px2 = d.x, py2 = d.y;
        if (dist > 0.1 && d.c > 0.001) {
          var push = d.c * gap * 0.34;
          px2 += dx / dist * push; py2 += dy / dist * push;
        }
        var col = band2 > band1 ? ORG : LIME;
        var bandv = Math.max(band1, band2);
        var a = (0.14 + bandv * 0.72 + Math.max(0, d.c) * 0.25) * side;
        ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + Math.min(1, a).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px2, py2, Math.max(0.2, r), 0, 6.2832); ctx.fill();
      }
      if (running && !reduced) raf = requestAnimationFrame(frame);
    }

    function start() { if (running) return; running = true; if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    function rel(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function onMove(e) {
      if (e.pointerType === 'touch' && !ptr.down) return;
      var p = rel(e); ptr.x = p.x; ptr.y = p.y; ptr.active = true; ptr.last = performance.now();
    }
    if (!reduced) {
      hero.addEventListener('pointermove', onMove, { passive: true });
      hero.addEventListener('pointerdown', function (e) { var p = rel(e); ptr.x = p.x; ptr.y = p.y; ptr.down = true; ptr.active = true; ptr.last = performance.now(); }, { passive: true });
      var up = function () { ptr.down = false; ptr.last = performance.now(); if (ptr.x < -900) ptr.active = false; };
      window.addEventListener('pointerup', up, { passive: true });
      window.addEventListener('pointercancel', up, { passive: true });
      hero.addEventListener('pointerleave', function () { ptr.active = false; }, { passive: true });
    }

    build();
    if (reduced) frame(performance.now());
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { build(); if (reduced) frame(performance.now()); }, 140);
    });
    if ('IntersectionObserver' in window && !reduced) {
      new IntersectionObserver(function (en) { en[0].isIntersecting && !document.hidden ? start() : stop(); }, { threshold: 0 }).observe(hero);
      document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    } else if (!reduced) { start(); }
  })();

  /* ---------- Teste de compressão ---------- */
  var rigEl = $('#rig');
  var cols = $$('.col', rigEl).map(function (c) {
    return { d: parseFloat(c.dataset.d), blk: $('.blk', c), plate: $('.plate', c) };
  });
  var gauge = $('#rigGauge'), status = $('#rigStatus'), slider = $('#load');
  var stackH = 0;
  function measure() { stackH = cols[0].blk.offsetHeight; }
  measure();
  window.addEventListener('resize', function () { measure(); renderRig(curL, curPhase); });

  var curL = 0, curPhase = 'rest';
  function renderRig(l, phase) {
    curL = l; curPhase = phase;
    cols.forEach(function (c) {
      var d = Math.max(-0.045, c.d * l);
      c.blk.style.transform = 'scale(' + (1 + d * 0.16).toFixed(4) + ',' + (1 - d).toFixed(4) + ')';
      c.plate.style.transform = 'translateY(' + (stackH * d).toFixed(2) + 'px)';
    });
    gauge.style.transform = 'scaleX(' + Math.min(1, Math.max(0, l)).toFixed(3) + ')';
    var label = phase === 'load' ? 'Aplicando carga' : phase === 'hold' ? 'Carga mantida' : phase === 'release' ? 'Alívio: a espuma volta' : 'Carga: 0';
    if (status.textContent !== label) status.textContent = label;
  }
  /* curva completa: carga, retenção e alívio com leve rebote (0..1) */
  function curve(p) {
    if (p < 0.1) return [0, 'rest'];
    if (p < 0.52) { var x = (p - 0.1) / 0.42; return [0.5 - 0.5 * Math.cos(Math.PI * x), 'load']; }
    if (p < 0.66) return [1, 'hold'];
    var r = Math.min(1, (p - 0.66) / 0.34);
    if (r >= 1) return [0, 'rest'];
    return [Math.exp(-4.4 * r) * Math.cos(8.2 * r), 'release'];
  }
  renderRig(0, 'rest');

  if (slider) {
    slider.addEventListener('input', function () {
      var v = slider.value / 100;
      if (demo) { demo.kill(); demo = null; }
      renderRig(v, v > 0.02 ? 'hold' : 'rest');
    });
  }
  var demo = null;
  function runDemo() {
    if (!hasGsap || reduced) return;
    var o = { p: 0 };
    demo = gsap.to(o, {
      p: 1, duration: 5.2, ease: 'none', delay: 0.4,
      onUpdate: function () { var c = curve(o.p); renderRig(c[0], c[1]); slider.value = Math.round(Math.max(0, c[0]) * 100); },
      onComplete: function () { demo = null; renderRig(0, 'rest'); slider.value = 0; }
    });
  }

  if (hasGsap && !reduced) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 600px)', function () {
      rigEl.classList.add('is-pinned');
      measure();
      var st = ScrollTrigger.create({
        trigger: '.dens__pin', start: 'top top', end: '+=170%', pin: true, scrub: 0.5, anticipatePin: 1,
        onUpdate: function (s) { var c = curve(s.progress); renderRig(c[0], c[1]); },
        onRefresh: measure
      });
      return function () { rigEl.classList.remove('is-pinned'); renderRig(0, 'rest'); };
    });
    mm.add('(max-width: 899px), (max-height: 599px)', function () {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { runDemo(); io.disconnect(); }
      }, { threshold: 0.55 });
      io.observe($('.rig__stage'));
      return function () { io.disconnect(); if (demo) { demo.kill(); demo = null; } };
    });
  }

  /* ---------- Acordeão de segmentos ---------- */
  var items = $$('.acc__item');
  items.forEach(function (it) {
    var btn = $('button', it);
    btn.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      items.forEach(function (o) {
        var isThis = o === it;
        var on = isThis ? open : false;
        o.classList.toggle('is-open', on);
        $('button', o).setAttribute('aria-expanded', String(on));
      });
      if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 600);
    });
  });
  var sel = $('#f-seg');
  $$('.acc a[data-seg]').forEach(function (a) {
    a.addEventListener('click', function () { if (sel) sel.value = a.dataset.seg; });
  });

  /* ---------- Formulário -> WhatsApp / e-mail ---------- */
  var form = $('#form'), note = $('#formNote');
  function compose() {
    var f = new FormData(form);
    var nome = (f.get('nome') || '').trim(), emp = (f.get('empresa') || '').trim(), seg = f.get('segmento') || '', msg = (f.get('mensagem') || '').trim();
    var t = 'Olá! Meu nome é ' + nome + (emp ? ', da empresa ' + emp : '') + '.';
    if (seg) t += '\nSegmento: ' + seg + '.';
    if (msg) t += '\n' + msg;
    else t += '\nGostaria de solicitar uma cotação.';
    return t;
  }
  function valid() {
    var n = $('#f-nome'), ok = n.value.trim().length > 1;
    n.parentNode.classList.toggle('is-err', !ok);
    if (!ok) { note.textContent = 'Informe o seu nome para continuar.'; n.focus(); }
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valid()) return;
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(compose()), '_blank', 'noopener');
    note.textContent = 'Abrimos o WhatsApp com a sua mensagem. Basta enviar por lá.';
  });
  $('#viaMail').addEventListener('click', function () {
    if (!valid()) return;
    window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Cotação de espumas técnicas') + '&body=' + encodeURIComponent(compose());
  });

  /* ---------- Animações de entrada ---------- */
  if (!hasGsap || reduced) return;

  // hero
  var tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
  tl.to('.hero__t .ln > span', { y: 0, duration: 1.2, stagger: 0.12 }, 0)
    .to('.hero .rv', { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.45);

  // revelações gerais
  ScrollTrigger.batch($$('.rv').filter(function (el) { return !el.closest('.hero'); }), {
    start: 'top 90%', once: true,
    onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }); }
  });

  // imagens: abertura por máscara
  $$('.mask-img').forEach(function (el) {
    var img = $('img', el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
      .to(el, { clipPath: 'inset(0% 0 0% 0)', duration: 1.25, ease: 'power3.inOut' }, 0)
      .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
  });

  // texto institucional: palavras acendem com o scroll
  var big = $('[data-words]');
  if (big) {
    var words = big.textContent.trim().split(/\s+/);
    big.setAttribute('aria-label', big.textContent.trim());
    big.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    gsap.to($$('.w', big), {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: big, start: 'top 82%', end: 'bottom 52%', scrub: 0.4 }
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
