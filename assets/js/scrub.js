/* ============================================================
   KP MEDIA — efeitos guiados pelo scroll (scrub)
   Mecânica do estudo de 17 técnicas: track alto + palco sticky,
   progresso 0→1 mapeado em propriedade, um rAF para tudo.
   Efeitos: wipe de painéis, mergulho por zoom, contador
   gigante, tipo em scrub e tilt 3D nos cards.
   ============================================================ */
window.KPSCRUB = (function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var fatia = function (p, a, b) { return clamp((p - a) / (b - a)); };

  /* Uma leitura de layout por elemento por frame: o bloco lê o rect uma vez
     e passa o mesmo objeto para o teste de proximidade e para o progresso. */
  function progR(r) {
    var alt = r.height - window.innerHeight;
    return alt <= 0 ? 0 : clamp(-r.top / alt);
  }
  function pertoR(r) {
    return r.bottom > -window.innerHeight && r.top < window.innerHeight * 2;
  }

  var wipes = [], mergulhos = [], contadores = [], tipos = [], portais = [], pipes = [], grades = [], linhas = [], explosoes = [], jornadas = [], heros = [], rodando = false, tiltOk = false, raioOk = false;

  function montar() {
    wipes = $$('.wipes').map(function (sec) {
      return { track: sec.querySelector('.scrub__track'), paineis: $$('.wipe', sec) };
    }).filter(function (w) { return w.track && w.paineis.length; });

    mergulhos = $$('.mergulho').map(function (sec) {
      return {
        track: sec.querySelector('.scrub__track'),
        a: sec.querySelector('.mg__a'),
        b: sec.querySelector('.mg__b'),
        letras: $$('.mg__palavra i > span', sec),
        marca: sec.querySelector('.mg__marca'),
        cap: sec.querySelector('.mg__cap')
      };
    }).filter(function (m) { return m.track && m.a && m.b; });

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

    explosoes = $$('.explode').map(function (sec) {
      return { track: sec.querySelector('.scrub__track'), caixa: sec.querySelector('.ex'), pecas: $$('.ex__peca', sec) };
    }).filter(function (e) { return e.track && e.pecas.length; });
    medirExplosoes();

    /* 03 — montagem por camadas. getTotalLength() só responde com o SVG
       no DOM e visível; por isso medimos a cada montar(), não uma vez só. */
    jornadas = $$('.jornada').map(function (sec) {
      var vaso = sec.querySelector('.j-vaso');
      if (vaso) {
        var L = vaso.getTotalLength();
        if (L > 0) {
          vaso.style.strokeDasharray = L;
          if (!reduz) vaso.style.strokeDashoffset = L;
          vaso.__L = L;
        }
      }
      return {
        track: sec.querySelector('.scrub__track'),
        vaso: vaso,
        nivel: sec.querySelector('.j-nivel'),
        itens: $$('.jornada__lista li', sec),
        fecho: sec.querySelector('.jornada__fecho')
      };
    }).filter(function (j) { return j.track && j.nivel; });

    heros = $$('.hero').filter(function (h) { return h.querySelector('.hero__saida'); }).map(function (h) {
      return { sec: h, alvos: $$('.hero__saida, h1 .mask', h), fundo: h.querySelector('.fundo') };
    });

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

  /* distância de cada camada até o centro da pilha, medida no DOM */
  function medirExplosoes() {
    explosoes.forEach(function (ex) {
      if (!ex.caixa) return;
      var meio = ex.caixa.offsetHeight / 2;
      ex.pecas.forEach(function (g) {
        g.__centro = g.offsetTop + g.offsetHeight / 2 - meio;
      });
    });
  }

  function passo(forcar) {
    var desligado = reduz;

    /* 02 (wipe) + 06 (tipo subindo) + 11 (foco).
       Cada painel tem TEMPO DE TELA: entra, segura 55% do seu trecho, só então recua. */
    wipes.forEach(function (w) {
      var rc = w.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      if (desligado) {
        w.paineis.forEach(function (el) { el.style.clipPath = ''; });
        return;
      }
      var p = progR(rc), n = w.paineis.length, seg = 1 / n;
      w.paineis.forEach(function (el, i) {
        /* recuo: só depois de segurar */
        var t = (i === n - 1) ? 0 : ease(fatia(p, i * seg + seg * .55, (i + 1) * seg));
        el.style.zIndex = n - i;
        el.style.clipPath = 'inset(0 0 ' + (t * 100).toFixed(2) + '% 0)';

        /* entrada: o conteúdo sobe enquanto o painel de cima ainda está saindo */
        var ent = i === 0
          ? ease(fatia(p, 0, seg * .3))
          : ease(fatia(p, i * seg - seg * .4, i * seg + seg * .12));

        var bg = el.querySelector('.bg');
        if (bg) bg.style.transform = 'scale(' + (1.14 - ent * .14).toFixed(4) + ')';

        var corte = el.querySelector('.wipe__corte');
        if (corte) corte.style.transform = 'translate3d(' + ((1 - ent) * 40).toFixed(1) + '%,0,0)';

        var fantasma = el.querySelector('.wipe__n');
        if (fantasma) fantasma.style.transform = 'translate3d(0,' + ((1 - ent) * 70 - t * 40).toFixed(1) + 'px,0)';

        var linhas = el.querySelectorAll('h3 .l i');
        for (var k = 0; k < linhas.length; k++) {
          var atraso = k * .14;
          var lt = i === 0
            ? ease(fatia(p, atraso * seg, seg * .3 + atraso * seg))
            : ease(fatia(p, i * seg - seg * (.4 - atraso), i * seg + seg * (.12 + atraso)));
          linhas[k].style.transform = 'translateY(' + ((1 - lt) * 108).toFixed(1) + '%)';
        }

        var desc = el.querySelector('p');
        if (desc) {
          var dt = i === 0 ? fatia(p, seg * .22, seg * .46) : fatia(p, i * seg - seg * .02, i * seg + seg * .26);
          desc.style.opacity = dt.toFixed(2);
          desc.style.transform = 'translateY(' + ((1 - dt) * 18).toFixed(1) + 'px)';
        }
        var tag = el.querySelector('.wipe__tag');
        if (tag) tag.style.opacity = (i === 0 ? fatia(p, seg * .34, seg * .56) : fatia(p, i * seg + seg * .1, i * seg + seg * .36)).toFixed(2);
      });
    });

    /* 22 — TRANSIÇÃO POR ZOOM, em quatro atos com respiro no meio:
       a palavra se compõe (0→.25), a marca pousa e a legenda entra
       (.18→.34), tudo fica parado (.34→.46), a câmera mergulha
       (.46→.80) e o lado de dentro emerge (.72→.94).
       A armadilha da receita: a opacidade da cena A só zera DEPOIS do
       zoom já ter estourado o quadro, senão aparece a emenda. */
    mergulhos.forEach(function (m) {
      var rc = m.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      if (desligado) {
        m.a.style.transform = m.a.style.opacity = '';
        m.b.style.transform = m.b.style.opacity = '';
        m.b.style.setProperty('--emerge', 1);
        m.marca.style.transform = m.marca.style.opacity = '';
        if (m.cap) m.cap.style.opacity = '';
        m.letras.forEach(function (el) { el.style.transform = ''; });
        return;
      }
      var p = progR(rc);

      /* ato 1 — letra por letra; o atraso entre elas é o efeito */
      m.letras.forEach(function (el, i) {
        var t = ease(fatia(p, i * .024, .11 + i * .024));
        el.style.transform = 'translate3d(0,' + ((1 - t) * 115).toFixed(1) + '%,0)';
      });

      /* ato 2 — a marca pousa no meio da palavra e a legenda entra */
      var pouso = ease(fatia(p, .17, .31));
      m.marca.style.transform = 'scale(' + (.74 + pouso * .26).toFixed(3) + ')';
      m.marca.style.opacity = pouso.toFixed(3);
      if (m.cap) m.cap.style.opacity = ease(fatia(p, .26, .35)).toFixed(3);

      /* ato 3 — o mergulho: escala exponencial ancorada no monograma */
      var dive = ease(fatia(p, .46, .80));
      m.a.style.transform = 'scale(' + Math.pow(1 + dive, 7).toFixed(3) + ')';
      m.a.style.opacity = (1 - fatia(p, .70, .81)).toFixed(3);

      /* ato 4 — o lado de dentro */
      var emerge = ease(fatia(p, .72, .94));
      m.b.style.transform = 'scale(' + (1.5 - emerge * .5).toFixed(3) + ')'
        + ' rotate(' + ((1 - emerge) * -7).toFixed(2) + 'deg)';
      m.b.style.opacity = emerge.toFixed(3);
      m.b.style.setProperty('--emerge', emerge.toFixed(3));
    });

    contadores.forEach(function (c) {
      if (desligado) return;
      var rc = c.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      var p = progR(rc), seg = 1 / c.itens.length;
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
      var rc = o.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      var p = progR(rc);
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
      var rc = o.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      var p = progR(rc);
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
      var rc = l.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      var p = progR(rc), seg = 1 / l.itens.length;
      var ativo = Math.min(l.itens.length - 1, Math.floor(p / seg));
      l.itens.forEach(function (el, i) { el.classList.toggle('on', i === ativo); });
      if (l.trilho) l.trilho.style.setProperty('--p', ease(p).toFixed(4));
      if (l.marcos.length) {
        var passou = Math.round(ease(p) * (l.marcos.length - 1));
        l.marcos.forEach(function (mk, i) { mk.classList.toggle('on', i <= passou); });
      }
    });

    /* 12 — as camadas se afastam; a chamada só entra quando a peça pousa
       (e viaja junto com ela, senão o fio aponta para o vazio) */

    /* 12 — cada camada sai do centro para a própria posição; a chamada só
       entra quando a peça pousa, e viaja junto (senão o fio aponta pro vazio) */
    explosoes.forEach(function (ex) {
      var rc = ex.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      if (desligado) {
        ex.pecas.forEach(function (g) { g.style.transform = ''; g.style.opacity = 1; });
        return;
      }
      var p = progR(rc);
      /* As camadas abrem até p=.58 e as chamadas acendem até p=.74. Antes a
         última chamada só chegava em .93: no celular isso é o fim de uma
         seção de 4,4 telas, e quase ninguém rolava até lá para ler. */
      ex.pecas.forEach(function (g, i) {
        var abre = ease(fatia(p, .06 + i * .035, .40 + i * .035));
        g.style.opacity = clamp(fatia(p, .02 + i * .03, .15 + i * .03)).toFixed(3);
        g.style.transform = 'translateY(' + (-(g.__centro || 0) * (1 - abre)).toFixed(1) + 'px)';
        var ch = g.querySelector('.ex__chamada');
        if (ch) ch.style.opacity = ease(fatia(p, .42 + i * .035, .56 + i * .035)).toFixed(3);
      });
    });

    /* 03 — um único rect sobe dentro do clipPath e revela as quatro faixas */
    jornadas.forEach(function (j) {
      var rc = j.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      if (desligado) {
        j.nivel.setAttribute('y', 20);
        if (j.vaso) j.vaso.style.strokeDashoffset = 0;
        j.itens.forEach(function (li) { li.classList.add('on'); });
        if (j.fecho) j.fecho.classList.add('on');
        return;
      }
      var p = progR(rc);
      if (j.vaso && j.vaso.__L) {
        j.vaso.style.strokeDashoffset = (j.vaso.__L * (1 - ease(fatia(p, 0, .16)))).toFixed(1);
      }
      var cheio = ease(fatia(p, .16, .9));           /* 0 = vazio, 1 = cheio */
      var y = 500 - cheio * 480;                      /* de 500 (fundo) a 20 (topo) */
      j.nivel.setAttribute('y', y.toFixed(1));
      /* a etapa acende quando o nível passa do meio da própria faixa */
      var meios = [445, 335, 225, 111];
      j.itens.forEach(function (li, i) { li.classList.toggle('on', y <= meios[i]); });
      if (j.fecho) j.fecho.classList.toggle('on', p > .9);
    });

    /* saída do hero: o topo entrega a página em vez de cortar seco */
    heros.forEach(function (h) {
      if (desligado) {
        h.alvos.forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
        if (h.fundo) h.fundo.style.opacity = '';
        return;
      }
      var alt = h.sec.offsetHeight || 1;
      var p = clamp(window.scrollY / (alt * .85));
      h.alvos.forEach(function (el, i) {
        el.style.transform = 'translate3d(0,' + (-p * (24 + i * 22)).toFixed(1) + 'px,0)';
        el.style.opacity = clamp(1 - p * 1.25).toFixed(3);
      });
      if (h.fundo) h.fundo.style.opacity = clamp(.85 - p * .8).toFixed(3);
    });

    grades.forEach(function (g) {
      var rc = g.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      if (desligado) { g.cols.forEach(function (c) { c.style.transform = ''; }); return; }
      var p = progR(rc), vel = [1, .55, 1.35];
      g.cols.forEach(function (c, i) {
        c.style.transform = 'translate3d(0,' + ((.5 - p) * window.innerHeight * (vel[i] || 1)).toFixed(1) + 'px,0)';
      });
    });

    tipos.forEach(function (t) {
      if (desligado) return;
      var rc = t.track.getBoundingClientRect();
      if (!forcar && !pertoR(rc)) return;
      var p = progR(rc);
      t.linhas.forEach(function (el, i) {
        var k = ease(fatia(p, .1 + i * .11, .44 + i * .11));
        el.style.transform = 'translateY(' + ((1 - k) * 108).toFixed(1) + '%)';
      });
      if (t.ass) t.ass.style.opacity = fatia(p, .5, .68).toFixed(2);
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
