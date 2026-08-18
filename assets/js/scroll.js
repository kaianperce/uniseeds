/* ============================================================
   KP MEDIA — efeitos de scroll
   Manifesto palavra a palavra · painéis empilhados · zoom de mídia.
   Sem biblioteca. Chame KPSCROLL.montar() depois de trocar conteúdo.
   ============================================================ */
window.KPSCROLL = (function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var manifestos = [], pilhas = [], midias = [], horizontais = [], ligado = false, luzLigada = false;

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

    // faixa horizontal: a altura da seção define quanto scroll a fita consome
    horizontais = $$('.horiz').map(function (sec) {
      return { sec: sec, fita: sec.querySelector('.horiz__fita'), barra: sec.querySelector('.horiz__barra i') };
    }).filter(function (h) { return h.fita; });
    medirHorizontais();

    if (!luzLigada && window.matchMedia('(pointer: fine)').matches && !reduz) {
      luzLigada = true;
      document.addEventListener('mousemove', function (e) {
        var card = e.target.closest && e.target.closest('.card, .horiz__card');
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }

    if (reduz) {
      manifestos.forEach(function (el) { $$('.w', el).forEach(function (w) { w.classList.add('on'); }); });
      return;
    }
    if (!ligado) {
      window.addEventListener('resize', medirHorizontais, { passive: true });
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

  /* a seção precisa ser tão alta quanto o excesso horizontal da fita */
  function medirHorizontais() {
    var estreito = window.matchMedia('(max-width:960px)').matches;
    horizontais.forEach(function (h) {
      if (estreito || reduz) { h.sec.style.height = ''; h.fita.style.transform = ''; h.excesso = 0; return; }
      h.excesso = Math.max(0, h.fita.scrollWidth - window.innerWidth);
      h.sec.style.height = (window.innerHeight + h.excesso) + 'px';
    });
  }

  function passo() {
    if (reduz) return;
    var tela = window.innerHeight;

    horizontais.forEach(function (h) {
      if (!h.excesso) return;
      var r = h.sec.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, -r.top / h.excesso));
      h.fita.style.transform = 'translate3d(' + (-p * h.excesso).toFixed(1) + 'px,0,0)';
      if (h.barra) h.barra.style.setProperty('--p', p.toFixed(4));
    });

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
