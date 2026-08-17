/* ============================================================
   KP MEDIA — comportamento e transições
   Vanilla JS, sem dependências. Tudo respeita prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  document.documentElement.classList.add('smooth');

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

  /* ---------- 2. Transição entre páginas ---------- */
  /* O efeito em si mora em fx.js (KPFX): glitch, portal, mosaico, scan,
     lâminas 45° ou cortina. Aqui só decidimos QUANDO ele roda. */
  var FX = window.KPFX;
  if (FX) FX.entrar();

  var navegando = false;
  function ehInterno(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.dataset.noTransition === '') return false;
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    // âncora na mesma página → rolagem normal
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!ehInterno(a)) return;
    if (reduz || !FX) return;
    if (e.target.closest('.fxpick')) return;
    e.preventDefault();
    if (navegando) return;
    navegando = true;
    var destino = a.href;
    FX.sair(function () { location.href = FX.destino ? FX.destino(destino) : destino; });
  });

  // volta pelo histórico (bfcache): reabre o efeito em vez de deixar a tela parada
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      navegando = false;
      if (FX) { FX.limpar(); FX.entrar(); }
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

  // headline da dobra entra sem esperar o observer
  requestAnimationFrame(function () {
    $$('[data-hero]').forEach(function (el) { el.classList.add('is-ready', 'in'); });
  });

  /* ---------- 6. Contadores ---------- */
  function contar(el) {
    var alvo = parseFloat(el.dataset.count);
    var sufixo = el.dataset.suffix || '';
    var dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduz) { el.textContent = alvo.toFixed(dec) + sufixo; return; }
    var ini = performance.now();
    var dur = 1400;
    function passo(agora) {
      var p = Math.min(1, (agora - ini) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (alvo * eased).toFixed(dec) + sufixo;
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

  /* ---------- 7. Parallax leve na arte do hero ---------- */
  var camadas = $$('[data-par]');
  if (camadas.length && !reduz) {
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

  /* ---------- 7b. Marquee: garante fita mais larga que a tela ---------- */
  $$('.marquee').forEach(function (m) {
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

  /* ---------- 9. Botões magnéticos + cursor ---------- */
  var fino = window.matchMedia('(pointer: fine)').matches;
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
})();
