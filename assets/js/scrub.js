/* ============================================================
   KP MEDIA — efeitos guiados pelo scroll (scrub)
   Mecânica do estudo de 17 técnicas: track alto + palco sticky,
   progresso 0→1 mapeado em propriedade, um rAF para tudo.
   Efeitos: wipe de painéis, oclusão tipográfica, contador
   gigante, tipo em scrub e tilt 3D nos cards.
   ============================================================ */
window.KPSCRUB = (function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var fatia = function (p, a, b) { return clamp((p - a) / (b - a)); };

  function prog(track) {
    var r = track.getBoundingClientRect();
    var alt = r.height - window.innerHeight;
    return alt <= 0 ? 0 : clamp(-r.top / alt);
  }
  function perto(track) {
    var r = track.getBoundingClientRect();
    return r.bottom > -window.innerHeight && r.top < window.innerHeight * 2;
  }

  var wipes = [], oclus = [], contadores = [], tipos = [], portais = [], pipes = [], grades = [], linhas = [], rodando = false, consoleOk = false, tiltOk = false, raioOk = false;

  function montar() {
    wipes = $$('.wipes').map(function (sec) {
      return { track: sec.querySelector('.scrub__track'), paineis: $$('.wipe', sec) };
    }).filter(function (w) { return w.track && w.paineis.length; });

    oclus = $$('.oclu').map(function (sec) {
      return {
        track: sec.querySelector('.scrub__track'),
        tras: sec.querySelector('.tras'),
        frente: sec.querySelector('.frente'),
        obj: sec.querySelector('.obj')
      };
    }).filter(function (o) { return o.track && o.obj; });

    contadores = $$('.contador').map(function (sec) {
      return {
        track: sec.querySelector('.scrub__track'),
        itens: $$('.item', sec),
        eixo: $$('.eixo i', sec)
      };
    }).filter(function (c) { return c.track && c.itens.length; });

    tipos = $$('.tipo').map(function (sec) {
      return {
        track: sec.querySelector('.scrub__track'),
        linhas: $$('.linha i', sec),
        ass: sec.querySelector('.ass')
      };
    }).filter(function (t) { return t.track && t.linhas.length; });

    portais = $$('.portal').map(function (sec) {
      return {
        track: sec.querySelector('.scrub__track'),
        dentro: sec.querySelector('.dentro'),
        anel: sec.querySelector('.anel')
      };
    }).filter(function (o) { return o.track && o.dentro; });

    pipes = $$('.pipe').map(function (sec) {
      var conns = $$('.conn', sec);
      conns.forEach(function (c) {
        var L = c.getTotalLength();
        c.style.strokeDasharray = L;
        if (!reduz) c.style.strokeDashoffset = L;
      });
      var nos = $$('.node', sec), chips = $$('.chip', sec);
      if (!reduz) {
        nos.forEach(function (n) { n.style.opacity = 0; });
        chips.forEach(function (c) { c.style.opacity = 0; });
      }
      return { track: sec.querySelector('.scrub__track'), nos: nos, conns: conns, chips: chips,
               legendas: $$('.pipe__legenda p', sec) };
    }).filter(function (o) { return o.track && o.nos.length; });

    grades = $$('.obra').map(function (sec) {
      return { track: sec.querySelector('.scrub__track'), cols: $$('.obra__col', sec) };
    }).filter(function (g) { return g.track && g.cols.length; });

    linhas = $$('.linha').map(function (sec) {
      return {
        track: sec.querySelector('.scrub__track'),
        itens: $$('.linha__item', sec),
        trilho: sec.querySelector('.linha__trilho i'),
        marcos: $$('.linha__marcos span', sec)
      };
    }).filter(function (l) { return l.track && l.itens.length; });

    montarConsole();
    montarRaiox();

    /* tilt 3D nos cards — uma vez só, por delegação */
    if (!tiltOk && window.matchMedia('(pointer: fine)').matches && !reduz) {
      tiltOk = true;
      document.addEventListener('pointermove', function (e) {
        var card = e.target.closest && e.target.closest('.cards .card');
        $$('.cards .card').forEach(function (c) { if (c !== card) c.style.transform = ''; });
        if (!card) return;
        var r = card.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
        card.style.transform = 'rotateY(' + ((mx - .5) * 10).toFixed(2) + 'deg)'
          + ' rotateX(' + ((.5 - my) * 10).toFixed(2) + 'deg) translateZ(8px)';
      }, { passive: true });
    }

    ligar();
    passo(true);
  }

  function passo(forcar) {
    var desligado = reduz;

    wipes.forEach(function (w) {
      if (!forcar && !perto(w.track)) return;
      if (desligado) {
        w.paineis.forEach(function (el) {
          el.style.clipPath = '';
          el.querySelector('h3').style.transform = '';
          el.querySelector('p').style.opacity = '';
        });
        return;
      }
      var p = prog(w.track), seg = 1 / w.paineis.length;
      w.paineis.forEach(function (el, i) {
        var t = ease(fatia(p, i * seg * .9, i * seg * .9 + seg * .9));
        el.style.zIndex = w.paineis.length - i;
        el.style.clipPath = i === w.paineis.length - 1
          ? 'inset(0 0 0 0)'
          : 'inset(0 0 ' + (t * 100).toFixed(2) + '% 0)';
        el.querySelector('h3').style.transform = 'translateY(' + (t * -46).toFixed(1) + 'px)';
        el.querySelector('p').style.opacity = (1 - t * 1.7).toFixed(2);
      });
    });

    oclus.forEach(function (o) {
      if (!forcar && !perto(o.track)) return;
      if (desligado) {
        if (o.tras) o.tras.style.transform = '';
        if (o.frente) o.frente.style.transform = '';
        o.obj.style.transform = '';
        return;
      }
      var p = prog(o.track);
      if (o.tras) o.tras.style.transform =
        'translateY(' + (70 - p * 170).toFixed(1) + 'px) scale(' + (1 + p * .16).toFixed(3) + ')';
      if (o.frente) o.frente.style.transform =
        'translateY(' + (140 - p * 340).toFixed(1) + 'px) scale(' + (1 + p * .05).toFixed(3) + ')';
      o.obj.style.transform =
        'translateY(' + (46 - p * 100).toFixed(1) + 'px)'
        + ' rotate(' + (-6 + p * 12).toFixed(2) + 'deg)'
        + ' scale(' + (.88 + p * .3).toFixed(3) + ')';
    });

    contadores.forEach(function (c) {
      if (desligado) return;
      if (!forcar && !perto(c.track)) return;
      var p = prog(c.track), seg = 1 / c.itens.length;
      var ativo = Math.min(c.itens.length - 1, Math.floor(p / seg));
      c.itens.forEach(function (el, i) {
        var local = fatia(p, i * seg, (i + 1) * seg);
        var vis = clamp(Math.min(fatia(local, 0, .22), 1 - fatia(local, .82, 1)));
        if (i === c.itens.length - 1) vis = clamp(fatia(local, 0, .22));
        el.style.opacity = vis.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - vis) * 26).toFixed(1) + 'px)';
        var alvo = el.querySelector('[data-alvo]');
        if (alvo) {
          var v = Math.round(ease(fatia(local, .05, .6)) * (+alvo.dataset.alvo));
          alvo.textContent = v;
        }
      });
      c.eixo.forEach(function (t, i) { t.classList.toggle('on', i <= ativo); });
    });

    portais.forEach(function (o) {
      if (desligado) return;
      if (!forcar && !perto(o.track)) return;
      var p = prog(o.track);
      var cresce = ease(fatia(p, .16, .8));
      var raioMax = Math.hypot(window.innerWidth, window.innerHeight) / 2;
      o.dentro.style.clipPath = 'circle(' + (cresce * raioMax * 1.04).toFixed(1) + 'px at 50% 50%)';
      o.dentro.style.transform = 'scale(' + (1.12 - cresce * .12).toFixed(4) + ')';
      if (o.anel) {
        var pulso = clamp(Math.min(fatia(p, .04, .16), 1 - fatia(p, .16, .3)));
        o.anel.style.opacity = pulso.toFixed(3);
        o.anel.style.transform = 'translate(-50%,-50%) scale(' + (1 + fatia(p, .04, .3) * 2.4).toFixed(3) + ')';
      }
    });

    pipes.forEach(function (o) {
      if (desligado) return;
      if (!forcar && !perto(o.track)) return;
      var p = prog(o.track);
      o.nos.forEach(function (n, i) {
        var t = ease(fatia(p, i * .17, i * .17 + .09));
        n.style.opacity = t.toFixed(3);
        var c = n.querySelector('circle');
        if (c) c.setAttribute('r', (46 * (.75 + t * .25)).toFixed(1));
      });
      o.conns.forEach(function (c, i) {
        var L = c.getTotalLength();
        c.style.strokeDashoffset = (L * (1 - ease(fatia(p, i * .17 + .07, i * .17 + .19)))).toFixed(1);
      });
      if (o.legendas && o.legendas.length) {
        var ativo = Math.min(o.legendas.length - 1, Math.floor(p / (1 / o.legendas.length)));
        o.legendas.forEach(function (l, i) { l.classList.toggle('on', i === ativo); });
      }
      o.chips.forEach(function (ch, i) {
        var t = ease(fatia(p, i * .17 + .05, i * .17 + .13));
        ch.style.opacity = t.toFixed(3);
        ch.setAttribute('transform', 'translate(0 ' + ((1 - t) * 12).toFixed(1) + ')');
      });
    });

    linhas.forEach(function (l) {
      if (desligado) return;
      if (!forcar && !perto(l.track)) return;
      var p = prog(l.track), seg = 1 / l.itens.length;
      var ativo = Math.min(l.itens.length - 1, Math.floor(p / seg));
      l.itens.forEach(function (el, i) { el.classList.toggle('on', i === ativo); });
      if (l.trilho) l.trilho.style.setProperty('--p', ease(p).toFixed(4));
      if (l.marcos.length) {
        var passou = Math.round(ease(p) * (l.marcos.length - 1));
        l.marcos.forEach(function (mk, i) { mk.classList.toggle('on', i <= passou); });
      }
    });

    grades.forEach(function (g) {
      if (!forcar && !perto(g.track)) return;
      if (desligado) { g.cols.forEach(function (c) { c.style.transform = ''; }); return; }
      var p = prog(g.track), vel = [1, .55, 1.35];
      g.cols.forEach(function (c, i) {
        c.style.transform = 'translate3d(0,' + ((.5 - p) * window.innerHeight * (vel[i] || 1)).toFixed(1) + 'px,0)';
      });
    });

    tipos.forEach(function (t) {
      if (desligado) return;
      if (!forcar && !perto(t.track)) return;
      var p = prog(t.track);
      t.linhas.forEach(function (el, i) {
        var k = ease(fatia(p, .1 + i * .11, .44 + i * .11));
        el.style.transform = 'translateY(' + ((1 - k) * 108).toFixed(1) + '%)';
      });
      if (t.ass) t.ass.style.opacity = fatia(p, .5, .68).toFixed(2);
    });
  }

  /* 09 — console de escopo: a aba troca o painel, a cor e o corte 45° */
  function montarConsole() {
    if (consoleOk) return;
    var secs = $$('.console');
    if (!secs.length) return;
    consoleOk = true;
    secs.forEach(function (sec) {
      var abas = $$('.console__abas button', sec);
      var paineis = $$('.console__painel', sec);
      var palco = sec.querySelector('.console__palco');
      function trocar(i) {
        abas.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
        paineis.forEach(function (pn, k) { pn.classList.toggle('on', k === i); });
        var cor = abas[i] && abas[i].dataset.cor;
        if (palco && cor) palco.style.setProperty('--acento', 'var(--' + cor + ')');
        if (sec.style) sec.style.setProperty('--acento', 'var(--' + cor + ')');
      }
      sec.querySelector('.console__abas').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-i]');
        if (b) trocar(+b.dataset.i);
      });
      sec.querySelector('.console__abas').addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var atual = abas.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; });
        var novo = (atual + (e.key === 'ArrowRight' ? 1 : -1) + abas.length) % abas.length;
        trocar(novo);
        abas[novo].focus();
        e.preventDefault();
      });
      trocar(0);
    });
  }

  /* 21 — revelação por cursor, com o foco passeando sozinho sem ponteiro */
  function montarRaiox() {
    if (raioOk || reduz) return;
    var secs = $$('.raiox');
    if (!secs.length) return;
    raioOk = true;
    var ultimoMove = 0;
    document.addEventListener('pointermove', function (e) {
      var sec = e.target.closest && e.target.closest('.raiox');
      if (!sec) return;
      ultimoMove = performance.now();
      var oculto = sec.querySelector('.raiox__oculto');
      var r = sec.getBoundingClientRect();
      oculto.style.setProperty('--x', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
      oculto.style.setProperty('--y', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      oculto.style.setProperty('--r', '200px');
    }, { passive: true });
    (function passeio(agora) {
      requestAnimationFrame(passeio);
      if (agora - ultimoMove < 2200) return;   /* o cursor manda enquanto se mexe */
      secs.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var oculto = sec.querySelector('.raiox__oculto');
        var t = agora / 1000;
        oculto.style.setProperty('--x', (50 + Math.sin(t * .5) * 30).toFixed(2) + '%');
        oculto.style.setProperty('--y', (50 + Math.cos(t * .37) * 24).toFixed(2) + '%');
        oculto.style.setProperty('--r', '170px');
      });
    })(0);
  }

  var pedido = false;
  function aoRolar() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () { passo(); pedido = false; });
  }

  function ligar() {
    if (rodando) return;
    rodando = true;
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', function () { passo(true); }, { passive: true });
  }

  montar();
  return { montar: montar, passo: passo };
})();
