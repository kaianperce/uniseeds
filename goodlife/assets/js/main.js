/* ============================================================
   GOOD LIFE · comportamento global
   Cabeçalho, menu, chegada do hero, gate (o objetivo da pessoa),
   links de WhatsApp, formulário, acordeão, índice das camadas,
   CTA fixo no celular. Vanilla, sem dependência.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- dados que o cliente pode trocar ---------- */
  var WHATS = '5511912900011';             /* número do WhatsApp, só dígitos com DDI */
  var MSG_BASE = 'Olá! Quero começar pela avaliação na Good Life.';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Chegada: título em máscara + anéis ---------- */
  function pronto() { document.documentElement.classList.add('is-pronto'); }
  if (reduz) pronto();
  else {
    var ok = false, marcar = function () { if (!ok) { ok = true; requestAnimationFrame(pronto); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(marcar);
    setTimeout(marcar, 900);
  }

  /* ---------- 2. Cabeçalho: transparente no topo, sólido ao rolar. Nunca esconde. ---------- */
  var nav = $('#nav');
  function estadoNav() { if (nav) nav.dataset.state = window.scrollY > 40 ? 'visible' : 'top'; }
  estadoNav();
  window.addEventListener('scroll', estadoNav, { passive: true });

  /* ---------- 3. Menu em tela cheia ---------- */
  var menu = $('#menu'), toggle = $('#toggle'), fechar = $('#fechar'), palco = $('#palco');
  var scrollAntes = 0;
  function abrirMenu() {
    if (!menu) return;
    var r = toggle.getBoundingClientRect();
    menu.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
    menu.style.setProperty('--my', (r.top + r.height / 2) + 'px');
    scrollAntes = window.scrollY;
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (palco) palco.inert = true;
    var primeiro = $('.menu__links a', menu);
    setTimeout(function () { (primeiro || fechar).focus(); }, 320);
  }
  function fecharMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (palco) palco.inert = false;
    window.scrollTo(0, scrollAntes);
    toggle.focus();
  }
  if (toggle) toggle.addEventListener('click', abrirMenu);
  if (fechar) fechar.addEventListener('click', fecharMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { document.body.style.overflow = ''; if (palco) palco.inert = false; }); });

  /* ---------- 4. Gate: o que a pessoa quer voltar a fazer ---------- */
  /* Cada chip tem data-verbo (voltar, continuar, evoluir, prevenir, performar, viver)
     e o texto do objetivo. A escolha fica na sessão e alimenta: o marcador em
     "Seis caminhos", o formulário e todos os links de WhatsApp. */
  var LINHAS = {
    voltar: 'Voltar. Quando existe algo que a dor ou a lesão tirou de você.',
    continuar: 'Continuar. Quando o objetivo é preservar movimento, saúde e independência.',
    evoluir: 'Evoluir. Quando estar bem já não é suficiente e o objetivo é chegar mais longe.',
    prevenir: 'Prevenir. Porque saúde não precisa começar quando aparece um problema.',
    performar: 'Performar. Porque performance é consequência de um corpo compreendido, preparado e acompanhado.',
    viver: 'Viver. Ter autonomia para viver a vida que importa para você.'
  };
  var objetivo = null;
  try { objetivo = JSON.parse(sessionStorage.getItem('gl:objetivo') || 'null'); } catch (e) {}

  var utm = null;
  try {
    var q = new URLSearchParams(location.search);
    utm = q.get('utm_source') || q.get('utm_campaign') || null;
    if (utm) sessionStorage.setItem('gl:utm', utm);
    else utm = sessionStorage.getItem('gl:utm');
  } catch (e) {}

  function mensagem(extra) {
    var m = MSG_BASE;
    if (objetivo && objetivo.texto) m += ' O que eu quero: ' + objetivo.texto.toLowerCase() + '.';
    if (extra) m += ' ' + extra;
    if (utm) m += ' (vim por ' + utm + ')';
    return m;
  }
  function urlWhats(extra) { return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(mensagem(extra)); }

  function atualizarLinks() {
    $$('a[data-whats]').forEach(function (a) { a.href = urlWhats(a.dataset.whats || ''); a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  }

  function aplicarObjetivo() {
    $$('.chip[data-verbo]').forEach(function (c) {
      c.setAttribute('aria-pressed', objetivo && c.textContent.trim() === objetivo.texto ? 'true' : 'false');
    });
    $$('.caminho').forEach(function (c) { c.classList.toggle('is-meu', !!objetivo && c.dataset.verbo === objetivo.verbo); });
    var resp = $('#gate-resp');
    if (resp) {
      if (objetivo) {
        resp.hidden = false;
        $('#gate-linha').textContent = LINHAS[objetivo.verbo] || '';
        $('#gate-obj').textContent = objetivo.texto;
      } else resp.hidden = true;
    }
    var campo = $('#f-objetivo');
    if (campo && objetivo && !campo.value) campo.value = objetivo.texto;
    atualizarLinks();
  }
  $$('.chip[data-verbo]').forEach(function (c) {
    c.addEventListener('click', function () {
      var texto = c.textContent.trim();
      if (objetivo && objetivo.texto === texto) objetivo = null;
      else objetivo = { verbo: c.dataset.verbo, texto: texto };
      try { sessionStorage.setItem('gl:objetivo', JSON.stringify(objetivo)); } catch (e) {}
      aplicarObjetivo();
    });
  });
  aplicarObjetivo();

  /* ---------- 5. Formulário: valida no blur, abre o WhatsApp já preenchido ---------- */
  var form = $('#form');
  if (form) {
    var nome = $('#f-nome'), fone = $('#f-fone'), obj = $('#f-objetivo');
    function erro(campo, msg) {
      var wrap = campo.closest('.campo'); wrap.classList.add('erro');
      wrap.querySelector('.campo__erro').textContent = msg; campo.dataset.erro = '1';
      campo.setAttribute('aria-invalid', 'true');
    }
    function limpa(campo) {
      var wrap = campo.closest('.campo'); wrap.classList.remove('erro'); delete campo.dataset.erro;
      campo.removeAttribute('aria-invalid');
    }
    function validaNome() { if (nome.value.trim().length < 2) { erro(nome, 'Diga como podemos te chamar.'); return false; } limpa(nome); return true; }
    function validaFone() {
      var d = fone.value.replace(/\D/g, '');
      if (d.length < 10 || d.length > 13) { erro(fone, 'O WhatsApp precisa ter DDD. Exemplo: (11) 90000-0000.'); return false; }
      limpa(fone); return true;
    }
    nome.addEventListener('blur', validaNome);
    fone.addEventListener('blur', validaFone);
    [nome, fone].forEach(function (c) { c.addEventListener('input', function () { if (c.dataset.erro) (c === nome ? validaNome : validaFone)(); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('#f-pot').value) return;               /* honeypot: robô */
      var okN = validaNome(), okF = validaFone();
      if (!okN || !okF) {
        var primeiro = !okN ? nome : fone;
        primeiro.focus(); primeiro.scrollIntoView({ block: 'center', behavior: reduz ? 'auto' : 'smooth' });
        return;
      }
      var unidade = (form.querySelector('input[name="unidade"]:checked') || {}).value || '';
      var d = fone.value.replace(/\D/g, '');
      var m = 'Olá! Sou ' + nome.value.trim() + ' e quero começar pela avaliação na Good Life.';
      if (obj.value.trim()) m += ' O que eu quero: ' + obj.value.trim() + '.';
      if (unidade) m += ' Unidade: ' + unidade + '.';
      m += ' Meu WhatsApp: ' + d + '.';
      if (utm) m += ' (vim por ' + utm + ')';
      var url = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(m);

      var bt = $('#f-enviar'); bt.disabled = true; bt.textContent = 'Abrindo o WhatsApp…';
      var aba = window.open(url, '_blank', 'noopener');
      setTimeout(function () {
        form.hidden = true;
        var ok = $('#form-ok'); ok.hidden = false;
        $('#ok-nome').textContent = nome.value.trim().split(' ')[0];
        $('#ok-link').href = url;
        ok.scrollIntoView({ block: 'center', behavior: reduz ? 'auto' : 'smooth' });
        if (!aba) $('#ok-link').focus();
      }, 400);
    });
  }

  /* ---------- 6. Acordeão (efeito 42) ---------- */
  $$('.acord__it').forEach(function (it) {
    var bt = $('.acord__bt', it);
    bt.addEventListener('click', function () {
      var aberto = it.classList.contains('is-open');
      $$('.acord__it.is-open').forEach(function (o) { o.classList.remove('is-open'); $('.acord__bt', o).setAttribute('aria-expanded', 'false'); });
      if (!aberto) { it.classList.add('is-open'); bt.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- 7. Índice das cinco camadas (scroll-spy) ---------- */
  var camadas = $$('.camada');
  if (camadas.length && 'IntersectionObserver' in window) {
    var links = $$('.camadas__idx a');
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    camadas.forEach(function (c) { io.observe(c); });
  }

  /* ---------- 8. CTA fixo no celular depois de 40% da página ---------- */
  var fixo = $('#cta-fixo'), contato = $('#contato') || $('.fecho');
  if (fixo) {
    var contatoVisivel = false;
    if (contato && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) { contatoVisivel = ents[0].isIntersecting; mostrarFixo(); }, { threshold: .05 }).observe(contato);
    }
    function mostrarFixo() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var p = total > 0 ? window.scrollY / total : 0;
      fixo.classList.toggle('is-on', p > .4 && !contatoVisivel);
    }
    window.addEventListener('scroll', mostrarFixo, { passive: true });
    mostrarFixo();
  }

  /* ---------- 9. Ano do rodapé ---------- */
  $$('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
