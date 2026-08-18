# KP Media — site institucional

Site estático da agência KP Media, em HTML/CSS/JS puro (sem build, sem dependências),
seguindo os tokens do Manual de Marca v1.0 — proporção 60% preto · 20% ciano · 15% rosa · 5% apoio.

## Rodar

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Abrir os arquivos direto pelo `file://` também funciona, mas a transição entre páginas
fica melhor servida por HTTP.

## Estrutura

```
index.html        Home — hero, marquee, pilares, manifesto, seis frentes, ritmo da operação, citação, faixa 45°, CTA
servicos.html     Fita horizontal das 6 frentes, raio-X, formatos de contratação e grade de entregáveis
metodo.html       Pipeline dos 90 dias + ciclo mensal em 4 atos + a jornada do público em camadas
contato.html      Formulário + atalhos de contato
assets/css/style.css   Folha única: tokens, componentes, os seis efeitos de transição, responsivo
assets/js/fx.js        Motor de transições entre páginas (+ seletor de efeito com ?fx na URL)
assets/js/scroll.js    Efeitos de scroll: manifesto, painéis empilhados, faixa horizontal, luz no cursor
assets/js/fundo.js     Fundo generativo em canvas (constelação da marca)
assets/js/scrub.js     Efeitos guiados pelo scroll: wipe, mergulho por zoom, contador gigante, tipo, tilt 3D
assets/js/main.js      Reveals, contadores, menu, nav, acordeão, parallax, cursor, formulário
```

## Transições entre páginas (motor FX)

`assets/js/fx.js` é um motor com **seis efeitos** de transição. Todos rodam em CSS + JS puro,
sem biblioteca, e cobrem a saída da página atual e a entrada da próxima.

| Efeito | Como se comporta |
| --- | --- |
| `glitch` | a página se corta em duas fatias curtas, com um fio ciano e outro rosa atravessando a tela uma vez; na chegada a primeira linha do título se **decodifica** |
| `portal` *(padrão)* | zoom + desfoque saindo, flash radial ciano discreto, próxima página vem de dentro |
| `mosaico` | dissolve em pixels: a tela vira uma grade de blocos que fecha e reabre em ordem aleatória, com blocos de acento da marca |
| `scan` | colapso de tubo CRT: a página encolhe até virar uma linha ciano com brilho, e reabre do mesmo jeito |
| `laminas` | oito faixas a 45° (o corte do `k`) entrando alternadas pelos dois lados, com fio colorido na borda |
| `cortina` | cinco colunas com borda de marca subindo em cascata — o mais sóbrio |

**Trocar o padrão:** uma linha em `assets/js/fx.js`

```js
var PADRAO = 'portal';   // cortina · portal · glitch · mosaico · laminas · scan
```

**Testar todos ao vivo:** abra qualquer página com `?fx` na URL (ex.: `index.html?fx=1`).
Aparece um seletor no canto inferior direito; a escolha fica salva e acompanha a navegação.
Sem `?fx` na URL, o seletor não existe — é só ferramenta de estúdio.

Cada efeito declara sua duração no próprio objeto em `MODOS` (`saida` / `entrada`),
então dá para calibrar o ritmo sem mexer no CSS. As durações estão entre 380 ms e 640 ms:
o suficiente para o efeito ler, curto o bastante para não atrapalhar quem está navegando.

Calibragem que vale manter em mente ao mexer: nada de inverter a tela inteira, nada de
animação em loop durante a transição e nenhum `filter` pesado sobre a página toda —
foi o que deixava o glitch "doido" na primeira versão.

## Efeitos de scroll

Três peças na linguagem dos "motion sites" — nenhuma usa biblioteca e nenhuma depende de mídia:

| Efeito | Onde | Como usar em outro lugar |
| --- | --- | --- |
| **Manifesto palavra a palavra** | home | `<p class="manifesto" data-palavras>` — o texto acende conforme a seção sobe. Prefixe uma palavra com `{ciano}` ou `{rosa}` para ela ganhar cor ao acender |
| **Painéis empilhados** | método | `class="steps pilha"` — cada etapa gruda no topo e a próxima cobre, com o filete da etapa ficando à mostra. Vira lista normal abaixo de 960px |
| **Slot de mídia com zoom** | home (hero) | `<figure class="midia" data-zoom>` com `<video>` ou `<img>` dentro — a mídia faz zoom lento enquanto atravessa a tela |

| **Fundo generativo** | home (hero) | `<canvas class="fundo" data-fundo>` — constelação de pontos ligados por fios, nas cores da marca, que o cursor empurra de leve. Roda a ~30 fps, pausa fora da tela e na aba oculta (`assets/js/fundo.js`, ~4 KB) |
| **Faixa horizontal travada** | serviços | `<section class="horiz">` — a página trava e a fita anda de lado; a altura da seção é calculada por JS a partir da largura da fita. No celular vira carrossel com *snap* |
| **Luz seguindo o cursor** | cards | radial ciano acompanhando o mouse via `--mx`/`--my`, só em ponteiro fino |

O hero hoje é só texto sobre o fundo generativo. Quando houver vídeo ou imagem,
o bloco comentado no `index.html` mostra o `<figure class="midia" data-zoom>` pronto para colar —
e **`assets/midia/README.md` tem as specs do que produzir** (duração, peso, formato, comandos de compressão).

## Efeitos em scrub (guiados pelo progresso do scroll)

Mecânica: seção alta (`.scrub__track`, 260–340vh) + palco `position:sticky` de 100vh,
com o progresso 0→1 mapeado em propriedades num único `requestAnimationFrame` (`assets/js/scrub.js`).
Os efeitos rodam também no celular (palco sticky é scroll nativo, não scroll-jacking);
só `prefers-reduced-motion` cai para as versões estáticas (`.so-mobile`).

| Efeito | Onde | O que faz |
| --- | --- | --- |
| **Wipe de painéis** | home (princípios) | combinação 02 + 06 + 11 da biblioteca: três painéis de tela cheia se revelando por `clip-path`, cada um com **tempo de tela** (segura 55% do trecho antes de recuar), o título subindo linha a linha de dentro da máscara, o fundo saindo do zoom para o foco e a faixa 45° da marca entrando pela direita. Sem foto, o herói do painel é a tipografia |
| **Mergulho na marca** | home ("O sistema") | efeito 22 (transição por zoom), em quatro atos com respiro no meio: SISTEMA se compõe letra por letra em contorno, o `kp` pousa no meio da palavra, tudo para por meia batida, a câmera mergulha (`scale` exponencial até 128×) e do outro lado emergem as seis frentes em anel, ligadas ao centro por fios que se desenham em `stroke-dashoffset`. Curso de 420vh: ~4,75 batidas a ~88vh. Substituiu a oclusão (07), que era o efeito errado para este site |
| **Explosão em camadas** | home (o que fazemos) | efeito 12: as seis frentes saem do centro para as próprias posições, e a chamada de cada uma só entra quando a peça pousa. Feito em HTML, não em SVG — em SVG o rótulo virava 4px no celular |
| **Linha do tempo** | home (primeiros 90 dias) | dia 15 → 30 → 90, um marco por segmento do scroll. Cada número vem com a promessa correspondente e o eixo mostra onde você está no trimestre — números soltos geravam mais dúvida do que resposta |
| **Tilt 3D** | cards de serviço | o card inclina seguindo o ponteiro, com título e lista em profundidade (`translateZ`) |
| **Portal** | home (antes do CTA) | um círculo abre do preto para o mundo claro — `clip-path: circle()` crescendo até engolir a diagonal da tela |
| **Pipeline de processo** | método | as quatro fases como nós SVG que acendem em sequência, conectores se desenhando via `stroke-dashoffset` e chips de entrega entrando depois |
| **Raio-X por cursor** | serviços | uma lanterna (`mask-image` radial) seguindo o cursor revela o diagrama do sistema por trás da frase; sem ponteiro, o foco passeia sozinho |
| **Fita das seis frentes** | serviços ("Escopo") | efeito 04 (galeria horizontal travada): a página trava e as seis frentes passam de lado, cada uma com número, descrição, entregáveis e a linha "no fim do mês você recebe". O curso não é chute: `altura = innerHeight + (fim do último card − início do primeiro + 2 calhas − innerWidth)`, o que dá 1px de scroll vertical para 1px de deslocamento lateral — ~342vh em 1440×900. Substituiu o console de abas (efeito 09), que escondia cinco das seis frentes atrás de um clique |
| **Montagem por camadas** | método ("A jornada") | efeito 03: o contorno do vaso se desenha por `stroke-dashoffset` e um único `rect` dentro de um `clipPath` sobe revelando as quatro faixas — alcance, engajamento, consideração e relação — enquanto a lista ao lado acende em sincronia. Curso de 420vh: 1 batida de contorno + 4 de camada + meia de fecho, ~78vh cada |
| **Saída do hero** | home | o rótulo, o parágrafo, os botões e as linhas do título sobem em velocidades diferentes e a constelação apaga conforme você deixa a dobra — o topo entrega a página em vez de cortar seco |
| **Grade editorial assimétrica** | home ("O que sai daqui") | nove peças em três colunas a velocidades diferentes (1 · 0,55 · 1,35), com o título por cima em `mix-blend-mode: difference`. É a seção de prova — os formatos que a KP entrega |

## Como dimensionar o curso de um efeito novo

Conte **batidas**, não chute vh. Uma batida é uma coisa que precisa ser percebida
(um traço que se desenha, uma camada que sobe, um nó que acende). A referência que a
biblioteca dá — 500vh para 5 nós — coloca o piso em torno de **70–80vh por batida**;
abaixo disso as batidas se atropelam e o efeito parece bug.

A jornada, por exemplo: 1 batida de contorno + 4 de camada + meia de fecho = 5,5 batidas.
420vh ÷ 5,5 ≈ 76vh por batida. Fecha.

Sobre `animation-timeline` nativo: seria possível para os efeitos simples, mas o Firefox
ainda não suporta e a página já tem um `requestAnimationFrame` único. Dois relógios diferentes
na mesma página é pior do que um relógio só — por isso tudo passa pelo motor.

## Armadilhas de composição já pagas aqui

- **Efeito sem o insumo que a receita pede é efeito errado.** A oclusão (07) exige recorte PNG de
  um objeto real — a receita diz que é o único custo dela. Aqui não existe objeto: o `kp` é
  tipografia. O `drop-shadow` empilhado que fez as vezes do recorte manchava a palavra de trás, e
  a palavra duplicada (cheia atrás, vazada na frente) em escalas diferentes lia como erro de
  impressão. A regra de escolha da biblioteca já dizia: site de **processo** usa 08, 05, 13, 21 —
  07 é da lista de site de **coisa**. Trocado pelo 22.
- **Três elementos grandes no mesmo centro viram mingau.** Vale para qualquer composição: ou os
  tamanhos são diferentes, ou os movimentos são, ou vira uma massa só.
- **Letra que sobe sem máscara não é revelação, é letra solta.** No mergulho, o atraso entre as
  sete letras de SISTEMA só lê como composição porque cada uma tem `overflow:hidden` próprio.
  Sem isso, o mesmo código produz sete letras boiando em alturas diferentes.
- **SVG não é responsivo para texto.** Um `viewBox` de 1120px reduzido para 367px de tela leva
  um rótulo de 12px para 4px. Diagrama com texto de leitura: faça em HTML.
- **`var()` não resolve em atributo de apresentação do SVG.** `font-family="var(--mono)"` é
  ignorado silenciosamente; use uma classe e o CSS.
- **`getTotalLength()` devolve 0 em SVG escondido.** No preview de página única o método
  começa oculto, então a medida é refeita a cada `montar()`, não uma vez só.
- **`scrollWidth` ignora o `padding` final em contêiner flex.** Medir o curso da fita por
  `scrollWidth − innerWidth` fazia o último card encostar na borda da tela enquanto o primeiro
  começava recuado pela calha. O curso certo vem da geometria dos cards:
  `último.offsetLeft + último.offsetWidth − primeiro.offsetLeft + calha × 2 − innerWidth`.
- **Largura de fita medida antes da fonte chegar é largura errada.** A remedição roda no
  `resize`, no `load` e em `document.fonts.ready` — não só no `montar()`.
- **`overflow-x:hidden` no `body` quebra `position:sticky`.** O `body` usa `overflow-x:clip`,
  que corta sem criar contêiner de rolagem; o palco sticky também.
- **Uma leitura de layout por elemento por frame.** `pertoR()` e `progR()` recebem o mesmo
  `rect` — antes cada bloco chamava `getBoundingClientRect()` duas vezes por quadro.
- **Uma fita horizontal por página.** Serviços tinha o console e a faixa de entregáveis; com a
  fita no escopo, os entregáveis viraram grade estática. Repetir o mesmo mecanismo na mesma
  página faz o segundo parecer bug, não efeito.
- **`grid-column` fora do alcance cria coluna fantasma.** No mobile, uma chamada em `grid-column:3`
  dentro de um grid de uma coluna gerava duas colunas implícitas e encolhia metade das lajes.

## Armadilhas de tipografia mascarada

O reveal de linha (`.l` com `overflow:hidden` + `i` com `translateY`) tem duas armadilhas que
já custaram caro aqui:

- **cada `<i>` precisa ser uma linha visual só.** Se o texto quebra dentro da máscara, a segunda
  linha fica cortada para sempre. Por isso as linhas são curtas e levam `white-space:nowrap`.
- **folga só embaixo, e o ponto de partida acompanha.** Com `line-height:.98` a máscara cortava o
  rabo das vírgulas e o pé do "g" e do "p". A `.mask` leva `padding-bottom:.18em` com
  `margin-bottom:-.18em` (a margem devolve o espaço no fluxo), e o `translateY` inicial sobe de
  110% para **126%**: a caixa ficou `(.98 + .18) / .98 = 1.184` mais alta, então 110% deixava o
  topo da linha aparecendo antes da hora. Colocar `padding-top` também parece resolver os
  acentos, mas abre uma fresta pela qual a linha seguinte espia — não use.
- **pontuação colorida é tempero, não confete.** No método as quatro vírgulas eram coloridas e o
  título virava quatro pontinhos soltos. Só a pontuação que fecha cada linha leva cor, como no
  resto do site.

## Ritmo da home — por que nem toda seção se mexe

A home alterna **alto → baixo → alto** de propósito. Entre o contador gigante e a faixa 45°
existe a seção `.respiro`: a citação e a lista de plataformas, sem nenhum efeito de scroll.
Ela existe justamente para o efeito seguinte voltar a impressionar.

A regra que a biblioteca de efeitos ensina — *"uma página com oito efeitos não parece premium,
parece demo"* — vale aqui: cada seção alta precisa de uma baixa depois. Ao adicionar qualquer
efeito novo à home, some também o silêncio correspondente, ou tire outro efeito de cena.

Os cursos (`.scrub__track`) estão entre 240vh e 330vh. Aumentar isso alonga a página inteira:
a home hoje tem ~16.000px de altura, cerca de 20 telas.

## Resto do movimento

| Efeito | Onde | Como funciona |
| --- | --- | --- |
| **Preloader** | home | barra + contador, uma única vez por sessão (`sessionStorage`) |
| **Títulos em máscara** | heros | cada linha sobe de dentro de um `overflow:hidden` |
| **Reveals no scroll** | seções | `IntersectionObserver` + `.rise`, escalonado por `data-delay="1..4"` |
| **Contadores** | home | números animam ao entrar na tela (`data-count`, `data-suffix`) |
| **Nav inteligente** | todas | fundo sólido ao rolar, esconde ao descer, barra de progresso de leitura |
| **Botões magnéticos + cursor** | desktop | `data-magnet` no elemento; cursor cresce sobre links e cards |
| **Marquee, acordeão, hover dos cards** | várias | CSS puro, com clonagem da fita em telas largas |

Tudo é desligado sob `prefers-reduced-motion: reduce` (a navegação vira troca seca de página),
e há um `<noscript>` em cada página que remove efeito e preloader caso o JS não rode.

## Regras de escrita

- **Sem travessão.** O `—` é a marca registrada de texto gerado por IA e não existe em nenhuma
  linha do site. Onde ele estava, a frase foi reescrita: vira ponto final, dois-pontos, vírgula
  ou parênteses, conforme o que a frase pede. Separador em `<title>` e rótulo é `·`, que já é o
  separador da marca.
- **A antítese "X, não Y" é tempero.** "Termina em decisão, não em print" é uma boa linha; seis
  delas na mesma página viram tique. Hoje sobram cinco no site inteiro, no máximo duas por página.

## Posicionamento e texto

O texto do site vem da proposta estratégica da KP (Open Foundation, 2026), não de frase pronta de agência.
A tese é a de lá: **conteúdo não termina quando é publicado — ele transforma conhecimento em alcance,
alcance em relação e relação em comunidade.** Os pilares são "estratégia antes de execução",
"sistema, não peça solta" e "constância cria memória".

As seis frentes cobrem o escopo real: estratégia e marca · conteúdo e direção de arte · mídia paga ·
SEO e GEO · landing pages e funil · e-mail marketing e base.

## Pontos de atenção antes de publicar

- **Logotipo**: o monograma `kp` está desenhado em fonte (`.logo`), o que o manual proíbe.
  Trocar pelo SVG oficial antes de ir ao ar — o favicon também é um placeholder.
- **Formulário**: não há back-end. O `submit` monta um `mailto:` preenchido.
  Para captar leads de verdade, apontar o `<form>` para um endpoint (Formspree, Basin, função serverless).
- **Links sociais e WhatsApp** estão como `#`.
- **Números da seção "O ritmo"** (15 dias, 90 dias, 11 etapas, 1 relatório) vieram do modelo de operação
  descrito na proposta. Conferir se valem como promessa pública para qualquer cliente.
- **Preços não estão no site** de propósito: os valores da proposta são de um escopo específico.
  Se quiser publicar faixa de investimento, é decisão comercial — dá para adicionar na página de serviços.
- **Números da seção "Em números"** são exemplos — conferir antes de publicar.
- A tipografia oficial (All Round Gothic) tem fallback em Poppins; Ubuntu e Ubuntu Sans Mono
  vêm do Google Fonts.
