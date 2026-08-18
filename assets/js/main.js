/* ============================================================
   KP MEDIA — comportamento e transições
   Base vanilla progressiva + camada GSAP/Lenis quando disponível.
   Regras da arquitetura:
   1. Efeito nunca segura conteúdo — o texto renderiza primeiro.
   2. Cursor customizado só em (hover:hover) and (pointer:fine).
   3. Tudo respeita prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var raiz = document.documentElement;

  /* ---------- 0. Camada de motion: GSAP + Lenis ---------- */
  var temGsap = !reduz && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var lenis = null;

  if (temGsap) {
    raiz.classList.add('gsap');
    gsap.registerPlugin(ScrollTrigger);
    if (typeof window.SplitText !== 'undefined') gsap.registerPlugin(SplitText);

    if (fino && typeof window.Lenis !== 'undefined') {
      raiz.classList.remove('smooth'); // Lenis assume a rolagem suave
      lenis = new Lenis({ autoRaf: false, lerp: 0.11 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      raiz.classList.add('smooth');
    }
  } else {
    raiz.classList.add('smooth');
    if (reduz) raiz.classList.add('no-pin');
  }

  /* ---------- 1. Preloader (uma vez por sessão) ---------- */
  var loader = $('#loader');
  function fecharLoader() {
    if (!loader) return;
    loader.classList.add('done');
    setTimeout(function () { loader.remove(); }, 600);
  }
  if (loader) {
    var jaViu = false;
    try { jaViu = sessionStorage.getItem('kp:visitou') === '1'; } catch (e) {}
    if (jaViu || reduz) {
      loader.remove();
      loader = null;
    } else {
      var barra = $('.loader__bar i', loader);
      var num = $('.loader__num', loader);
      var pct = 0;
      var t = setInterval(function () {
        pct = Math.min(100, pct + Math.random() * 18 + 6);
        if (barra) barra.style.width = pct + '%';
        if (num) num.textContent = String(Math.round(pct)).padStart(3, '0') + ' %';
        if (pct >= 100) {
          clearInterval(t);
          setTimeout(fecharLoader, 260);
        }
      }, 130);
      try { sessionStorage.setItem('kp:visitou', '1'); } catch (e) {}
    }
  }

  /* ---------- 2. Transição entre páginas (cortina diagonal 45°) ---------- */
  var curtain = $('#curtain');

  function abrirCortina() {
    if (!curtain) return;
    curtain.classList.remove('is-out');
    curtain.classList.add('is-cover');
    void curtain.offsetWidth; // força o layout antes de animar
    requestAnimationFrame(function () { curtain.classList.add('is-in'); });
    setTimeout(function () {
      curtain.classList.remove('is-cover', 'is-in');
    }, 900);
  }

  if (curtain && !reduz) abrirCortina();

  var navegando = false;
  function ehInterno(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.dataset.noTransition === '') return false;
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.pathname === location.pathname && url.hash) return false; // âncora local
    return true;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;

    // âncora na mesma página com Lenis ativo → rolagem suave controlada
    var urlA;
    try { urlA = new URL(a.href, location.href); } catch (er) { urlA = null; }
    if (lenis && urlA && urlA.origin === location.origin &&
        urlA.pathname === location.pathname && urlA.hash) {
      var alvoHash = $(urlA.hash);
      if (alvoHash) {
        e.preventDefault();
        lenis.scrollTo(alvoHash, { offset: -70 });
        history.pushState(null, '', urlA.hash);
        return;
      }
    }

    if (!ehInterno(a)) return;
    if (reduz || !curtain) return;
    if (navegando) { e.preventDefault(); return; }
    e.preventDefault();
    navegando = true;
    curtain.classList.remove('is-cover', 'is-in');
    curtain.classList.add('is-out');
    var destino = a.href;
    setTimeout(function () { location.href = destino; }, 620);
  });

  // volta pelo histórico (bfcache): reabre a cortina em vez de deixar a tela preta
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      navegando = false;
      if (curtain && !reduz) abrirCortina();
    }
  });

  /* ---------- 3. Nav: fundo sólido, auto-hide e progresso ---------- */
  var nav = $('#nav');
  var prog = $('#prog');
  var ultimo = window.scrollY;

  function noScroll() {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle('solid', y > 20);
      var menuAberto = menu && menu.classList.contains('open');
      nav.classList.toggle('hide', y > 320 && y > ultimo && !menuAberto);
    }
    if (prog) {
      var alt = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (alt > 0 ? Math.min(1, y / alt) : 0) + ')';
    }
    ultimo = y;
  }

  /* ---------- 4. Menu mobile ---------- */
  var toggle = $('#toggle');
  var menu = $('#menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var aberto = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      });
    });
  }

  window.addEventListener('scroll', noScroll, { passive: true });
  noScroll();

  /* ---------- 5. Reveals no scroll ---------- */
  var alvos = $$('.rise, .step, .ft__rule');
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    alvos.forEach(function (el) { io.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 5b. Texto que se monta (SplitText — só H1 e H2) ---------- */
  var temSplit = temGsap && typeof window.SplitText !== 'undefined';

  // headline do hero: caracteres sobem dentro das máscaras de linha
  var hero = $('[data-hero]');
  if (hero && temSplit) {
    var linhas = $$('.mask > span', hero);
    gsap.set(linhas, { y: 0 }); // a máscara CSS sai de cena; o split assume
    linhas.forEach(function (linha, i) {
      // words+chars: a quebra de linha acontece na palavra, nunca no meio dela
      var split = new SplitText(linha, { type: 'words,chars', charsClass: 'st-ch' });
      gsap.from(split.chars, {
        yPercent: 120,
        rotate: 4,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.018,
        delay: 0.15 + i * 0.12
      });
    });
    hero.classList.add('is-ready', 'in');
  } else {
    requestAnimationFrame(function () {
      $$('[data-hero]').forEach(function (el) { el.classList.add('is-ready', 'in'); });
    });
  }

  // títulos de seção marcados com data-split: palavras sobem no scroll
  if (temSplit) {
    $$('[data-split]').forEach(function (el) {
      var split = new SplitText(el, { type: 'lines,words', linesClass: 'st-line' });
      gsap.from(split.words, {
        yPercent: 115,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.03,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }

  /* ---------- 5c. Scroll horizontal dos cases (pin + scrub) ---------- */
  var hsec = $('.hsec');
  if (hsec) {
    var podePinar = temGsap && fino && window.innerWidth > 960;
    if (podePinar) {
      var track = $('.htrack', hsec);
      var pin = $('.hsec__pin', hsec);
      var barraProg = $('.hsec__prog i', hsec);
      var dist = function () {
        return Math.max(0, track.scrollWidth - document.documentElement.clientWidth + 96);
      };
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: hsec,
          start: 'top top',
          end: function () { return '+=' + (dist() + window.innerHeight * 0.35); },
          pin: pin,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
      tl.to(track, { x: function () { return -dist(); }, ease: 'none' }, 0);
      if (barraProg) tl.to(barraProg, { scaleX: 1, ease: 'none' }, 0);
    } else {
      raiz.classList.add('no-pin'); // rolagem nativa com scroll-snap
    }
  }

  /* ---------- 5d. Parallax sutil via GSAP (quando presente) ---------- */
  if (temGsap) {
    $$('[data-par]').forEach(function (el) {
      var f = parseFloat(el.dataset.par) || 0.1;
      gsap.to(el, {
        yPercent: f * 220,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  } else if (!reduz) {
    var camadas = $$('[data-par]');
    if (camadas.length) {
      var ticking = false;
      var mover = function () {
        var y = window.scrollY;
        camadas.forEach(function (el) {
          var f = parseFloat(el.dataset.par) || 0.1;
          el.style.transform = 'translate3d(0,' + (y * f).toFixed(2) + 'px,0)';
        });
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(mover); }
      }, { passive: true });
    }
  }

  /* ---------- 5e. Reveals extras (só com GSAP) ---------- */
  if (temGsap) {
    // arte do hero entra por clip-path diagonal
    var arte = $('.hero .art');
    if (arte) {
      gsap.from(arte, {
        clipPath: 'polygon(0 100%, 100% 0, 100% 0, 0 100%)',
        duration: 1.1, ease: 'expo.out', delay: 0.35,
        onComplete: function () { gsap.set(arte, { clearProps: 'clipPath' }); }
      });
    }
    // listas entram em cascata conforme aparecem
    ScrollTrigger.batch('.case-row, .case-art i, .member', {
      start: 'top 88%',
      once: true,
      onEnter: function (els) {
        gsap.from(els, { autoAlpha: 0, y: 28, duration: 0.7, ease: 'expo.out', stagger: 0.09 });
      }
    });
  }

  /* ---------- 6. Contadores ---------- */
  function contar(el) {
    var alvo = parseFloat(el.dataset.count);
    var prefixo = el.dataset.prefix || '';
    var sufixo = el.dataset.suffix || '';
    var dec = (el.dataset.count.split('.')[1] || '').length;
    var fmt = function (v) { return prefixo + v.toFixed(dec).replace('.', ',') + sufixo; };
    if (reduz) { el.textContent = fmt(alvo); return; }
    var ini = performance.now();
    var dur = 1400;
    function passo(agora) {
      var p = Math.min(1, (agora - ini) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(alvo * eased);
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  var nums = $$('[data-count]');
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      var ioN = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) { contar(en.target); ioN.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      nums.forEach(function (el) { ioN.observe(el); });
    } else {
      nums.forEach(contar);
    }
  }

  /* ---------- 7. Marquee: garante fita mais larga que a tela ---------- */
  $$('.marquee, .sectors').forEach(function (m) {
    var base = $('.marquee__track', m);
    if (!base) return;
    var guarda = 0;
    while (base.getBoundingClientRect().width * m.children.length < window.innerWidth * 2 && guarda++ < 8) {
      m.appendChild(base.cloneNode(true));
    }
  });

  /* ---------- 8. Acordeão ---------- */
  $$('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var aberto = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(aberto));
    });
  });

  /* ---------- 9. Botões magnéticos + cursor da marca ---------- */
  if (fino && !reduz) {
    var cursor = $('#cursor');
    if (cursor) {
      var cx = 0, cy = 0, tx = 0, ty = 0, ligado = false;
      window.addEventListener('mousemove', function (e) {
        tx = e.clientX; ty = e.clientY;
        if (!ligado) { ligado = true; cursor.classList.add('on'); cx = tx; cy = ty; }
      }, { passive: true });
      (function loop() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      document.addEventListener('mouseover', function (e) {
        var alvo = e.target.closest && e.target.closest('a, button, .card, input, textarea');
        cursor.classList.toggle('big', !!alvo);
      });
    }

    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + mx * 0.18 + 'px,' + (my * 0.24 - 2) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 10. Formulário (sem back-end: monta um e-mail) ---------- */
  var form = $('#form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dados = new FormData(form);
      var corpo = [
        'Nome: ' + (dados.get('nome') || ''),
        'Empresa: ' + (dados.get('empresa') || ''),
        'E-mail: ' + (dados.get('email') || ''),
        'Frente: ' + (dados.get('frente') || ''),
        '',
        (dados.get('mensagem') || '')
      ].join('\n');
      var msg = $('.form__msg', form);
      if (msg) {
        msg.textContent = 'Abrindo seu e-mail…';
        msg.classList.add('show');
      }
      window.location.href = 'mailto:contato@kpmedia.com.br'
        + '?subject=' + encodeURIComponent('Diagnóstico — ' + (dados.get('empresa') || dados.get('nome') || 'novo contato'))
        + '&body=' + encodeURIComponent(corpo);
    });
  }

  /* ============================================================
     11. Consentimento de cookies (LGPD / orientação ANPD)
     - aceitar e recusar com o mesmo destaque visual
     - nada pré-marcado; não essenciais BLOQUEADOS até o aceite
     - revogar é tão fácil quanto aceitar (link no rodapé)
     ============================================================ */
  var CK = 'kp:consent:v1';

  function lerConsent() {
    try { return JSON.parse(localStorage.getItem(CK)); } catch (e) { return null; }
  }
  function aplicarConsent(c) {
    if (!c) return;
    if (c.analytics) carregarAnalytics();
    if (c.ads) carregarAds();
  }
  function carregarAnalytics() {
    if (window.__kpGA) return;
    window.__kpGA = true;
    /* Cookies de ANALYTICS só chegam aqui DEPOIS do opt-in.
       Colar o snippet do GA4 quando houver ID:
       var s=document.createElement('script');s.async=true;
       s.src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
       document.head.appendChild(s);
       window.dataLayer=window.dataLayer||[];
       function gtag(){dataLayer.push(arguments)}
       gtag('js',new Date());gtag('config','G-XXXXXXX'); */
  }
  function carregarAds() {
    if (window.__kpAds) return;
    window.__kpAds = true;
    /* Pixel do Meta / tags de publicidade só DEPOIS do opt-in. */
  }

  var ckbar = $('#ckbar');
  if (ckbar) {
    var opts = $('#ck-opts');
    var inAn = $('#ck-analytics');
    var inAds = $('#ck-ads');

    function salvarConsent(c) {
      c.ts = new Date().toISOString();
      try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {}
      aplicarConsent(c);
      ckbar.classList.remove('show');
    }
    function mostrarBar(abrirOpts) {
      var c = lerConsent();
      if (inAn) inAn.checked = !!(c && c.analytics);
      if (inAds) inAds.checked = !!(c && c.ads);
      if (opts) opts.classList.toggle('open', !!abrirOpts);
      ckbar.classList.add('show');
    }

    var salvo = lerConsent();
    if (salvo) { aplicarConsent(salvo); }
    else { setTimeout(function () { mostrarBar(false); }, reduz ? 200 : 1400); }

    var bAceitar = $('#ck-accept');
    var bRecusar = $('#ck-reject');
    var bPref = $('#ck-pref');
    var bSalvar = $('#ck-save');
    if (bAceitar) bAceitar.addEventListener('click', function () {
      salvarConsent({ necessarios: true, analytics: true, ads: true });
    });
    if (bRecusar) bRecusar.addEventListener('click', function () {
      salvarConsent({ necessarios: true, analytics: false, ads: false });
    });
    if (bPref) bPref.addEventListener('click', function () {
      if (opts) opts.classList.toggle('open');
    });
    if (bSalvar) bSalvar.addEventListener('click', function () {
      salvarConsent({
        necessarios: true,
        analytics: !!(inAn && inAn.checked),
        ads: !!(inAds && inAds.checked)
      });
    });

    // revogação: qualquer link/botão com data-cookie-prefs reabre o painel
    $$('[data-cookie-prefs]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        mostrarBar(true);
        ckbar.setAttribute('tabindex', '-1');
        ckbar.focus({ preventScroll: false });
      });
    });
  }
})();
