/* ============================================================
   KP MEDIA — fundo generativo em canvas
   Constelação de pontos ligados por fios, nas cores da marca.
   ~4 KB, sem WebGL, sem biblioteca. Pausa fora da tela e na aba oculta.
   ============================================================ */
window.KPFUNDO = (function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var telas = [];

  function criar(canvas) {
    var ctx = canvas.getContext('2d');
    var pontos = [], larg = 0, alt = 0, dpr = 1;
    var mouse = { x: -9999, y: -9999 };
    var visivel = true, rodando = false, quadro = 0;

    var DENSIDADE = 1 / 16000;   // pontos por px² — calibrado para não poluir
    var LIGACAO = 132;           // distância máxima do fio, em px
    var CORES = ['37,244,238', '255,43,84', '255,222,0'];

    function medir() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      larg = r.width; alt = r.height;
      canvas.width = Math.round(larg * dpr);
      canvas.height = Math.round(alt * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var quantos = Math.max(18, Math.min(90, Math.round(larg * alt * DENSIDADE)));
      pontos = [];
      for (var i = 0; i < quantos; i++) {
        pontos.push({
          x: Math.random() * larg,
          y: Math.random() * alt,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.8,
          cor: CORES[i % 7 === 0 ? 1 : (i % 11 === 0 ? 2 : 0)]
        });
      }
    }

    function desenhar() {
      ctx.clearRect(0, 0, larg, alt);

      for (var i = 0; i < pontos.length; i++) {
        var p = pontos[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = larg + 20; else if (p.x > larg + 20) p.x = -20;
        if (p.y < -20) p.y = alt + 20; else if (p.y > alt + 20) p.y = -20;

        // o cursor empurra de leve, sem "grudar"
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 15000 && d2 > 1) {
          var f = (1 - d2 / 15000) * 0.5;
          var d = Math.sqrt(d2);
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.cor + ',.5)';
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();

        for (var j = i + 1; j < pontos.length; j++) {
          var q = pontos[j];
          var lx = p.x - q.x, ly = p.y - q.y;
          var dist = Math.sqrt(lx * lx + ly * ly);
          if (dist > LIGACAO) continue;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(' + p.cor + ',' + (0.14 * (1 - dist / LIGACAO)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    function laco() {
      if (!rodando) return;
      quadro++;
      if (quadro % 2 === 0) desenhar();   // ~30 fps: suficiente e metade do custo
      requestAnimationFrame(laco);
    }

    function tocar() {
      if (rodando || !visivel || document.hidden || reduz) return;
      // o canvas pode ter mudado de tamanho enquanto estava escondido
      if (Math.abs(canvas.getBoundingClientRect().width - larg) > 1) medir();
      rodando = true; requestAnimationFrame(laco);
    }
    function parar() { rodando = false; }

    medir();
    desenhar();

    if (!reduz) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (ents) {
          visivel = ents[0].isIntersecting;
          if (visivel) tocar(); else parar();
        }, { threshold: 0 }).observe(canvas);
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) parar(); else tocar();
      });
      window.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      }, { passive: true });
      window.addEventListener('mouseout', function () { mouse.x = mouse.y = -9999; }, { passive: true });
      window.addEventListener('resize', function () { medir(); desenhar(); }, { passive: true });
      tocar();
    }

    return { parar: parar, tocar: tocar };
  }

  function montar() {
    Array.prototype.slice.call(document.querySelectorAll('canvas[data-fundo]')).forEach(function (c) {
      if (c.dataset.pronto === '1') return;
      c.dataset.pronto = '1';
      telas.push(criar(c));
    });
  }

  montar();
  return { montar: montar };
})();
