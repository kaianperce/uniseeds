/* ============================================================
   GOOD LIFE · efeitos guiados pelo scroll
   Motor de 40 linhas: um requestAnimationFrame para a página
   inteira, só calcula seções perto da viewport, uma leitura de
   layout por elemento por quadro. Anima só transform e opacity.
   Efeitos: 08 pipeline (home), manifesto palavra a palavra (home),
   tipo em scrub "Cuidar é" (quem somos).
   ============================================================ */
window.GLSCROLL = (function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var fatia = function (p, a, b) { return clamp((p - a) / (b - a)); };

  function progR(r) {              /* progresso 0→1 de um track pelo rect já lido */
    var alt = r.height - window.innerHeight;
    return alt <= 0 ? 0 : clamp(-r.top / alt);
  }
  function pertoR(r) {
    return r.bottom > -window.innerHeight * .5 && r.top < window.innerHeight * 1.5;
  }

  var fx = [];

  /* ---------- 08 · Pipeline: sete nós, sete frases ---------- */
  function montarPipe(sec) {
    var track = $('.scrub__track', sec);
    var nos = $$('.no', sec), cons = $$('.no__con i', sec), frases = $$('.pipe__frase', sec);
    var fim = $('.pipe__fim', sec), cont = $('[data-etapa]', sec);
    if (!track || !nos.length) return;
    var n = nos.length, ini = .06, fat = (.935 - ini) / n;
    var atual = -1;
    fx.push({
      track: track,
      fn: function (p) {
        for (var i = 0; i < n; i++) {
          var a = ini + i * fat;
          var q = fatia(p, a, a + fat);          /* 0→1 dentro da fatia do nó */
          var acende = ease(fatia(q, 0, .35));
          var anel = nos[i].querySelector('.no__anel');
          anel.style.transform = 'scale(' + (.78 + .22 * acende).toFixed(3) + ')';
          if (q > .02 && !nos[i].classList.contains('on')) nos[i].classList.add('on');
          if (q <= .02 && nos[i].classList.contains('on')) nos[i].classList.remove('on');
          if (i === n - 1) nos[i].classList.toggle('fim', q > .5);
          if (cons[i]) cons[i].style.transform = 'scaleX(' + ease(fatia(q, .4, 1)).toFixed(3) + ')';

          /* frase i: entra em .15, fica até a próxima entrar, sai mais rápido */
          var prox = ini + (i + 1) * fat;
          var entra = ease(fatia(p, a + fat * .12, a + fat * .38));
          var sai = (i === n - 1) ? 0 : ease(fatia(p, prox + fat * .12, prox + fat * .28));
          var op = entra * (1 - sai);
          frases[i].style.opacity = op.toFixed(3);
          frases[i].style.transform = 'translateY(' + ((1 - entra) * 24 - sai * 18).toFixed(1) + 'px)';
          frases[i].style.visibility = op > .01 ? 'visible' : 'hidden';
        }
        if (fim) {
          var f = ease(fatia(p, .93, 1));
          fim.style.opacity = f.toFixed(3);
          fim.style.transform = 'translateY(' + ((1 - f) * 14).toFixed(1) + 'px)';
        }
        var idx = Math.min(n - 1, Math.max(-1, Math.floor((p - ini) / fat)));
        if (idx !== atual) { atual = idx; sec.dataset.etapa = idx + 1; if (cont) cont.textContent = String(Math.max(1, idx + 1)).padStart(2, '0'); }
      }
    });
  }

  /* ---------- Manifesto palavra a palavra (sem sticky) ---------- */
  function montarManifesto(el) {
    /* envolve cada palavra num <span class="w">, preservando <em> */
    function envolver(node) {
      var filhos = Array.prototype.slice.call(node.childNodes);
      filhos.forEach(function (c) {
        if (c.nodeType === 3) {
          var partes = c.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          partes.forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) envolver(c);
      });
    }
    envolver(el);
    var ws = $$('.w', el), n = ws.length, ligadas = 0;
    if (reduz) { ws.forEach(function (w) { w.classList.add('on'); }); return; }
    fx.push({
      track: el,
      solto: true,
      fn: function (p) {
        var alvo = Math.round(p * n);
        if (alvo === ligadas) return;
        if (alvo > ligadas) for (var i = ligadas; i < alvo; i++) ws[i].classList.add('on');
        else for (var j = alvo; j < ligadas; j++) ws[j].classList.remove('on');
        ligadas = alvo;
      },
      prog: function (r) {          /* acende entre o topo a 85% da tela e o pé a 40% */
        var vh = window.innerHeight;
        return clamp((vh * .85 - r.top) / (r.height + vh * .45));
      }
    });
  }

  /* ---------- "Cuidar é": tipo em scrub, sete batidas ---------- */
  function montarCuidar(sec) {
    var track = $('.scrub__track', sec);
    var bats = $$('.cuidar__bat', sec), pontos = $$('.cuidar__idx i', sec);
    if (!track || !bats.length) return;
    var n = bats.length, fat = 1 / n;
    fx.push({
      track: track,
      fn: function (p) {
        var atual = Math.min(n - 1, Math.floor(p / fat));
        for (var i = 0; i < n; i++) {
          var q = fatia(p, i * fat, (i + 1) * fat);
          var ultima = i === n - 1;
          var eNao = ease(fatia(q, 0, .2)), eSim = ease(fatia(q, .1, .36));
          var sai = ultima ? 0 : ease(fatia(q, .84, 1));
          var vis = q > 0 && (ultima || q < 1);
          bats[i].style.opacity = vis ? (1 - sai).toFixed(3) : 0;
          bats[i].style.visibility = vis ? 'visible' : 'hidden';
          var nao = bats[i].querySelector('.nao'), sim = bats[i].querySelector('.sim');
          if (nao) { nao.style.opacity = eNao.toFixed(3); nao.style.transform = 'translateY(' + ((1 - eNao) * 20 - sai * 30).toFixed(1) + 'px)'; }
          if (sim) { sim.style.opacity = eSim.toFixed(3); sim.style.transform = 'translateY(' + ((1 - eSim) * 40 - sai * 50).toFixed(1) + 'px)'; }
          if (pontos[i]) pontos[i].classList.toggle('on', i <= atual);
        }
      }
    });
  }

  /* ---------- loop único ---------- */
  var rodando = false;
  function quadro() {
    for (var i = 0; i < fx.length; i++) {
      var e = fx[i], r = e.track.getBoundingClientRect();
      if (!pertoR(r)) continue;
      e.fn(e.prog ? e.prog(r) : progR(r));
    }
    requestAnimationFrame(quadro);
  }

  function montar() {
    $$('.pipe').forEach(montarPipe);
    $$('.manifesto[data-palavras]').forEach(montarManifesto);
    $$('.cuidar').forEach(montarCuidar);
    if (reduz) {
      /* estado estático: CSS já mostra tudo; só garante nós acesos */
      $$('.no').forEach(function (n) { n.classList.add('on'); });
      return;
    }
    if (!rodando && fx.length) { rodando = true; requestAnimationFrame(quadro); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();

  return { montar: montar };
})();
