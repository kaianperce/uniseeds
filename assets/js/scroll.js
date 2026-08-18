/* ============================================================
   KP MEDIA — efeitos de scroll
   Manifesto palavra a palavra · painéis empilhados · zoom de mídia.
   Sem biblioteca. Chame KPSCROLL.montar() depois de trocar conteúdo.
   ============================================================ */
window.KPSCROLL = (function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var manifestos = [], pilhas = [], midias = [], ligado = false;

  /* quebra o texto em palavras uma única vez; {ciano} e {rosa} marcam destaque */
  function fatiar(el) {
    if (el.dataset.pronto === '1') return;
    var texto = el.textContent.trim();
    el.innerHTML = texto.split(/\s+/).map(function (palavra) {
      var cor = /^\{ciano\}/.test(palavra) ? ' ciano' : (/^\{rosa\}/.test(palavra) ? ' rosa' : '');
      return '<span class="w' + cor + '">' + palavra.replace(/^\{(ciano|rosa)\}/, '') + '</span> ';
    }).join('');
    el.dataset.pronto = '1';
  }

  function montar() {
    manifestos = $$('[data-palavras]');
    manifestos.forEach(fatiar);

    pilhas = $$('.pilha');
    pilhas.forEach(function (pilha) {
      $$('.step', pilha).forEach(function (step, i) { step.style.setProperty('--i', i); });
    });

    midias = $$('.midia[data-zoom]');

    if (reduz) {
      manifestos.forEach(function (el) { $$('.w', el).forEach(function (w) { w.classList.add('on'); }); });
      return;
    }
    if (!ligado) {
      var esperando = false;
      window.addEventListener('scroll', function () {
        if (esperando) return;
        esperando = true;
        requestAnimationFrame(function () { passo(); esperando = false; });
      }, { passive: true });
      window.addEventListener('resize', passo, { passive: true });
      ligado = true;
    }
    passo();
  }

  function passo() {
    if (reduz) return;
    var tela = window.innerHeight;

    manifestos.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = (tela * 0.82 - r.top) / (r.height + tela * 0.34);
      p = Math.max(0, Math.min(1, p));
      var palavras = el.querySelectorAll('.w');
      var acesas = Math.round(p * palavras.length);
      for (var i = 0; i < palavras.length; i++) palavras[i].classList.toggle('on', i < acesas);
    });

    pilhas.forEach(function (pilha) {
      var passos = $$('.step', pilha);
      passos.forEach(function (step, i) {
        var prox = passos[i + 1];
        step.classList.toggle('recuado', !!prox && prox.getBoundingClientRect().top < tela * 0.55);
      });
    });

    midias.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = (tela - r.top) / (tela + r.height);
      p = Math.max(0, Math.min(1, p));
      el.style.setProperty('--zoom', (1.14 - p * 0.14).toFixed(4));
    });
  }

  return { montar: montar, passo: passo };
})();
