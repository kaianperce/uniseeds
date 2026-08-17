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
assets/css/style.css   Folha única: tokens, componentes, motion, responsivo
assets/js/main.js      Transições, reveals, contadores, menu, acordeão, cursor, formulário
```

## Transições e movimento

| Efeito | Onde | Como funciona |
| --- | --- | --- |
| **Cortina entre páginas** | todas | 5 colunas com borda colorida sobem em cascata ao clicar num link interno, a navegação acontece atrás delas e as colunas descem na página nova (`.curtain`, `is-out` / `is-cover` / `is-in`) |
| **Preloader** | home | barra + contador, uma única vez por sessão (`sessionStorage`) |
| **Títulos em máscara** | heros | cada linha sobe de dentro de um `overflow:hidden` |
| **Reveals no scroll** | seções | `IntersectionObserver` + `.rise`, com escalonamento via `data-delay="1..4"` |
| **Contadores** | home | números animam ao entrar na tela (`data-count`, `data-suffix`) |
| **Parallax** | arte do hero | camadas com `data-par` (fator de deslocamento) |
| **Nav inteligente** | todas | fundo sólido ao rolar, esconde ao descer, barra de progresso de leitura |
| **Botões magnéticos + cursor** | desktop | `data-magnet` no elemento; cursor customizado cresce sobre links e cards |
| **Marquee, acordeão, hover dos cards** | várias | CSS puro, com clonagem da fita quando a tela é mais larga que a faixa |

Tudo é desligado sob `prefers-reduced-motion: reduce`, e há um `<noscript>` em cada página
que remove a cortina/preloader caso o JS não rode.

## Pontos de atenção antes de publicar

- **Logotipo**: o monograma `kp` está desenhado em fonte (`.logo`), o que o manual proíbe.
  Trocar pelo SVG oficial antes de ir ao ar — o favicon também é um placeholder.
- **Formulário**: não há back-end. O `submit` monta um `mailto:` preenchido.
  Para captar leads de verdade, apontar o `<form>` para um endpoint (Formspree, Basin, função serverless).
- **Links sociais e WhatsApp** estão como `#`.
- **Números da seção "Em números"** são exemplos — conferir antes de publicar.
- A tipografia oficial (All Round Gothic) tem fallback em Poppins; Ubuntu e Ubuntu Sans Mono
  vêm do Google Fonts.
