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
index.html        Home — hero, marquee, pilares, serviços, números, citação, faixa 45°, CTA
servicos.html     Escopo das três frentes + formatos de contratação (acordeão)
metodo.html       Quatro etapas, combinados do que a KP não faz, FAQ
contato.html      Formulário + atalhos de contato
assets/css/style.css   Folha única: tokens, componentes, os seis efeitos de transição, responsivo
assets/js/fx.js        Motor de transições entre páginas (+ seletor de efeito com ?fx na URL)
assets/js/scroll.js    Efeitos de scroll: manifesto, painéis empilhados, faixa horizontal, luz no cursor
assets/js/fundo.js     Fundo generativo em canvas (constelação da marca)
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

O slot de mídia já está no hero, hoje com a geometria da marca no lugar do arquivo.
Para trocar por vídeo, o bloco comentado no `index.html` mostra a linha exata —
e **`assets/midia/README.md` tem as specs do que produzir** (duração, peso, formato, comandos de compressão).

## Resto do movimento

| Efeito | Onde | Como funciona |
| --- | --- | --- |
| **Preloader** | home | barra + contador, uma única vez por sessão (`sessionStorage`) |
| **Títulos em máscara** | heros | cada linha sobe de dentro de um `overflow:hidden` |
| **Reveals no scroll** | seções | `IntersectionObserver` + `.rise`, escalonado por `data-delay="1..4"` |
| **Contadores** | home | números animam ao entrar na tela (`data-count`, `data-suffix`) |
| **Parallax** | arte do hero | camadas com `data-par` (fator de deslocamento) |
| **Nav inteligente** | todas | fundo sólido ao rolar, esconde ao descer, barra de progresso de leitura |
| **Botões magnéticos + cursor** | desktop | `data-magnet` no elemento; cursor cresce sobre links e cards |
| **Marquee, acordeão, hover dos cards** | várias | CSS puro, com clonagem da fita em telas largas |

Tudo é desligado sob `prefers-reduced-motion: reduce` (a navegação vira troca seca de página),
e há um `<noscript>` em cada página que remove efeito e preloader caso o JS não rode.

## Pontos de atenção antes de publicar

- **Logotipo**: o monograma `kp` está desenhado em fonte (`.logo`), o que o manual proíbe.
  Trocar pelo SVG oficial antes de ir ao ar — o favicon também é um placeholder.
- **Formulário**: não há back-end. O `submit` monta um `mailto:` preenchido.
  Para captar leads de verdade, apontar o `<form>` para um endpoint (Formspree, Basin, função serverless).
- **Links sociais e WhatsApp** estão como `#`.
- **Números da seção "Em números"** são exemplos — conferir antes de publicar.
- A tipografia oficial (All Round Gothic) tem fallback em Poppins; Ubuntu e Ubuntu Sans Mono
  vêm do Google Fonts.
