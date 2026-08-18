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
  var estreito = window.matchMedia('(max-width: 960px)');
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

  var wipes = [], oclus = [], contadores = [], tipos = [], rodando = false, tiltOk = false;

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
    var desligado = reduz || estreito.matches;

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
    if (estreito.addEventListener) estreito.addEventListener('change', function () { passo(true); });
  }

  montar();
  return { montar: montar, passo: passo };
})();
