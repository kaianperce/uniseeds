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
      return {
        sec: sec,
        fita: sec.querySelector('.horiz__fita'),
        barra: sec.querySelector('.horiz__barra i'),
        indice: $$('.horiz__indice button', sec),
        cards: $$('.horiz__card', sec),
        pos: [], excesso: 0, ativo: -1
      };
    }).filter(function (h) { return h.fita && h.cards.length; });
    medirHorizontais();
    ligarIndice();

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
      window.addEventListener('resize', remedir, { passive: true });
      window.addEventListener('load', remedir);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(remedir);
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

  /* A seção precisa ser tão alta quanto o excesso horizontal da fita: 1px de
     scroll vertical = 1px de deslocamento lateral. Assim a fita percorre exata-
     mente do primeiro ao último card, sem sobra e sem corte.
     Medimos de novo no resize, no load e quando as fontes chegam — largura de
     texto medida antes da fonte carregar dá um excesso errado. */
  function medirHorizontais() {
    var estreito = window.matchMedia('(max-width:960px)').matches;
    horizontais.forEach(function (h) {
      var base = h.cards[0].offsetLeft;
      h.pos = h.cards.map(function (c) { return c.offsetLeft - base; });
      if (estreito || reduz) {
        h.sec.style.height = '';
        h.fita.style.transform = '';
        h.excesso = 0;
        return;
      }
      /* Do começo do primeiro card ao fim do último, mais a calha dos dois lados:
         no fim do curso o último card encosta na calha da direita, exatamente
         como o primeiro encostava na da esquerda no começo. Não usamos
         scrollWidth porque ele ignora o padding final em contêiner flex. */
      var ult = h.cards[h.cards.length - 1];
      var calha = parseFloat(getComputedStyle(h.fita).paddingLeft) || 0;
      var largura = ult.offsetLeft + ult.offsetWidth - base;
      h.excesso = Math.max(0, largura + calha * 2 - window.innerWidth);
      h.pos = h.pos.map(function (d) { return Math.min(d, h.excesso); });
      h.sec.style.height = (window.innerHeight + h.excesso) + 'px';
    });
  }

  /* Índice de teclado: cada botão leva ao card correspondente. No modo travado
     isso vira uma posição de scroll da página; parado, rola a própria fita. */
  function ligarIndice() {
    horizontais.forEach(function (h) {
      if (!h.indice.length || h.sec.__indiceOk) return;
      h.sec.__indiceOk = true;
      h.indice.forEach(function (b, i) {
        b.addEventListener('click', function () { irPara(h, i); });
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var n = (i + d + h.indice.length) % h.indice.length;
          h.indice[n].focus();
          irPara(h, n);
        });
      });
    });
  }

  function irPara(h, i) {
    var card = h.cards[i];
    if (!card) return;
    var suave = reduz ? 'auto' : 'smooth';
    if (!h.excesso) {
      marcar(h, i);
      if (h.fita.scrollWidth > h.fita.clientWidth + 1) {
        h.fita.scrollTo({ left: h.pos[i], behavior: suave });
      } else {
        card.scrollIntoView({ block: 'nearest', behavior: suave });
      }
      return;
    }
    var topo = h.sec.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.round(topo + h.pos[i]), behavior: suave });
  }

  function marcar(h, i) {
    if (h.ativo === i) return;
    h.ativo = i;
    h.indice.forEach(function (b, k) {
      if (k === i) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  function remedir() { medirHorizontais(); passo(); }

  function passo() {
    if (reduz) return;
    var tela = window.innerHeight;

    horizontais.forEach(function (h) {
      if (!h.excesso) return;
      var r = h.sec.getBoundingClientRect();               /* uma leitura por seção */
      if (r.bottom < 0 || r.top > tela) return;            /* só o que está à vista */
      var p = Math.max(0, Math.min(1, -r.top / h.excesso));
      var d = p * h.excesso;
      h.fita.style.transform = 'translate3d(' + (-d).toFixed(1) + 'px,0,0)';
      if (h.barra) h.barra.style.setProperty('--p', p.toFixed(4));
      if (h.indice.length) {
        var i = 0;
        for (var k = 0; k < h.pos.length; k++) if (h.pos[k] <= d + 6) i = k;
        marcar(h, i);
      }
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
