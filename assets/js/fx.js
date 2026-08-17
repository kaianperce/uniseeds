/* ============================================================
   KP MEDIA — motor de transições entre páginas
   Seis modos, todos em CSS + JS puro. Trocar o padrão: PADRAO abaixo.
   Testar todos ao vivo: adicione ?fx na URL e use o seletor.
   ============================================================ */
window.KPFX = (function () {
  'use strict';

  var PADRAO = 'portal';   // cortina · portal · glitch · mosaico · laminas · scan

  var MODOS = [
    { id: 'portal',  nome: 'Portal',      desc: 'zoom com desfoque e flash ciano',  saida: 420, entrada: 620, camadas: 'flash' },
    { id: 'glitch',  nome: 'Glitch',      desc: 'duas fatias e um corte de cor',    saida: 380, entrada: 420, camadas: 'ruido+barras', letras: 1 },
    { id: 'mosaico', nome: 'Mosaico',     desc: 'dissolve em pixels',               saida: 480, entrada: 560, camadas: 'celulas' },
    { id: 'scan',    nome: 'Scanline',    desc: 'colapso de tubo CRT',              saida: 420, entrada: 580, camadas: 'linha', letras: 1 },
    { id: 'laminas', nome: 'Lâminas 45°', desc: 'faixas diagonais do k',            saida: 520, entrada: 620, camadas: 'laminas' },
    { id: 'cortina', nome: 'Cortina',     desc: 'colunas com borda de marca',       saida: 480, entrada: 640, camadas: 'col' }
  ];

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHAVE = 'kp:fx';
  var fx, marca, palco, modo, ocupado = false;

  function achar(id) {
    for (var i = 0; i < MODOS.length; i++) if (MODOS[i].id === id) return MODOS[i];
    return MODOS[0];
  }

  function escolhido() {
    var url = new URLSearchParams(location.search).get('fx');
    if (url && achar(url).id === url) return url;
    try {
      var salvo = localStorage.getItem(CHAVE);
      if (salvo && achar(salvo).id === salvo) return salvo;
    } catch (e) {}
    return PADRAO;
  }

  /* ---- camadas de cada efeito ---- */
  function montar(m) {
    var html = '';
    if (m.camadas === 'col') html = '<div class="col"><i></i><i></i><i></i><i></i><i></i></div>';
    if (m.camadas === 'flash') html = '<div class="flash"></div>';
    if (m.camadas === 'ruido+barras') html = '<div class="ruido"></div><div class="barra"></div><div class="barra"></div>';
    if (m.camadas === 'linha') html = '<div class="linha"></div>';
    if (m.camadas === 'laminas') html = '<div class="laminas"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
    if (m.camadas === 'celulas') {
      var cols = Math.max(8, Math.ceil(window.innerWidth / 72));
      var linhas = Math.max(6, Math.ceil(window.innerHeight / 72));
      var cels = '';
      for (var i = 0; i < cols * linhas; i++) {
        var acento = i % 23 === 0 ? ' a1' : (i % 37 === 0 ? ' a2' : (i % 53 === 0 ? ' a3' : ''));
        cels += '<b class="' + acento.trim() + '" style="transition-delay:' + Math.round(Math.random() * 180) + 'ms"></b>';
      }
      html = '<div class="celulas" style="--cols:' + cols + '">' + cels + '</div>';
    }
    fx.innerHTML = html;
  }

  function aplicar(id) {
    modo = achar(id);
    document.documentElement.dataset.fx = modo.id;
    montar(modo);
    try { localStorage.setItem(CHAVE, modo.id); } catch (e) {}
  }

  /* ---- decodificação de letras (usada por glitch e scan) ---- */
  var GLIFOS = '▚▞▖▘/\\<>·#kp0123456789';
  function decodificar(el, dur) {
    var original = el.innerHTML;
    var texto = el.textContent;
    var ini = performance.now();
    (function passo(agora) {
      var p = Math.min(1, (agora - ini) / dur);
      if (p >= 1) { el.innerHTML = original; return; }
      var travadas = Math.floor(texto.length * p);
      var saida = '';
      for (var i = 0; i < texto.length; i++) {
        if (i < travadas || texto[i] === ' ') saida += texto[i];
        else saida += GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
      }
      el.textContent = saida;
      requestAnimationFrame(passo);
    })(performance.now());
  }

  function letrasDaPagina(escopo) {
    // só as primeiras linhas do título — o resto entra pela máscara, sem competir
    var linhas = (escopo || document).querySelectorAll('h1 .mask > span');
    var quantas = Math.min(linhas.length, typeof modo.letras === 'number' ? modo.letras : 0);
    for (var i = 0; i < quantas; i++) {
      (function (el, atraso) {
        setTimeout(function () { decodificar(el, 320); }, atraso);
      })(linhas[i], i * 70);
    }
  }

  /* ---- entrada e saída ---- */
  function entrar(escopo) {
    if (!fx) return;
    if (reduz) { fx.className = 'fx'; if (palco) palco.classList.remove('sai', 'entra'); return; }
    fx.classList.remove('is-out', 'is-in');
    fx.classList.add('cobre');
    if (palco) { palco.classList.remove('sai'); palco.classList.add('entra'); }
    void fx.offsetWidth;
    requestAnimationFrame(function () { fx.classList.add('is-in'); });
    if (modo.letras) letrasDaPagina(escopo);
    setTimeout(function () {
      fx.classList.remove('cobre', 'is-in');
      if (palco) palco.classList.remove('entra');
    }, modo.entrada + 120);
  }

  function sair(depois) {
    if (reduz || !fx) { depois(); return; }
    if (ocupado) return;
    ocupado = true;
    fx.classList.remove('cobre', 'is-in');
    fx.classList.add('is-out');
    if (palco) { palco.classList.remove('entra'); palco.classList.add('sai'); }
    setTimeout(function () { ocupado = false; depois(); }, modo.saida);
  }

  function limpar() {
    ocupado = false;
    if (fx) fx.classList.remove('is-out', 'is-in', 'cobre');
    if (palco) palco.classList.remove('sai', 'entra');
  }

  /* ---- seletor (só com ?fx na URL ou window.KP_FX_PICKER) ---- */
  var seletorAtivo = false;
  function seletor() {
    if (!/[?&]fx\b/.test(location.search) && !window.KP_FX_PICKER) return;
    seletorAtivo = true;
    var cx = document.createElement('div');
    cx.className = 'fxpick';
    var lista = MODOS.map(function (m) {
      return '<button type="button" data-id="' + m.id + '" aria-pressed="' + (m.id === modo.id) + '">'
        + m.nome + '<small>' + m.desc + '</small></button>';
    }).join('');
    cx.innerHTML = '<div class="fxpick__lista">' + lista + '</div>'
      + '<button class="fxpick__btn" type="button" aria-expanded="false">Efeito: <b>' + modo.nome + '</b></button>';
    document.body.appendChild(cx);

    var btn = cx.querySelector('.fxpick__btn');
    btn.addEventListener('click', function () {
      var aberto = cx.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', String(aberto));
    });
    cx.querySelector('.fxpick__lista').addEventListener('click', function (e) {
      var alvo = e.target.closest('button[data-id]');
      if (!alvo) return;
      aplicar(alvo.dataset.id);
      cx.querySelectorAll('button[data-id]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === alvo));
      });
      btn.querySelector('b').textContent = modo.nome;
      cx.classList.remove('aberto');
      btn.setAttribute('aria-expanded', 'false');
      entrar();   // mostra o efeito escolhido na hora
    });
  }

  /* ---- mantém o modo escolhido ao trocar de página (só com o seletor ligado) ---- */
  function destino(url) {
    if (!seletorAtivo) return url;
    try {
      var u = new URL(url, location.href);
      u.searchParams.set('fx', modo.id);
      return u.href;
    } catch (e) { return url; }
  }

  /* ---- inicialização ---- */
  function iniciar() {
    palco = document.getElementById('palco');
    fx = document.createElement('div');
    fx.className = 'fx';
    fx.setAttribute('aria-hidden', 'true');
    marca = document.createElement('div');
    marca.className = 'fx__marca';
    marca.setAttribute('aria-hidden', 'true');
    marca.innerHTML = '<span class="logo"><span class="k">k</span><span class="p">p</span></span>';
    document.body.appendChild(fx);
    document.body.appendChild(marca);
    aplicar(escolhido());
    seletor();
    window.addEventListener('resize', function () { if (modo.camadas === 'celulas') montar(modo); });
  }

  iniciar();

  return { entrar: entrar, sair: sair, limpar: limpar, aplicar: aplicar, destino: destino, modos: MODOS, atual: function () { return modo; } };
})();
