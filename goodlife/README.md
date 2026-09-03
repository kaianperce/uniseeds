# Good Life Health Center · site

Site institucional em HTML/CSS/JS puro, sem build e sem dependência. Construído sobre o
**Brandbook v01 2026** e a **Estratégia de discurso v01 2026** ("Cuidar para viver"), com a
biblioteca scroll-fx: plano antes do código, direção visual antes do movimento, CSS nativo
antes de JavaScript, no máximo três efeitos por página.

O plano completo (descoberta, mapa de scroll, storyboard, emendas e o que o cliente precisa
confirmar) está em `mapa-de-scroll.md`. É a documentação real do projeto.

## Rodar

```bash
cd goodlife
python3 -m http.server 8000
# abra http://localhost:8000
```

Abrir por `file://` também funciona; só a transição entre páginas e o preload das fontes
ficam melhores servidos por HTTP.

## Estrutura

```
index.html          Home: hero, a chegada (gate), manifesto, seis caminhos, quatro frentes,
                    a experiência Good (pipeline), cuidado e limite, casas e espaço, contato
quem-somos.html     Essência, cinco camadas, "Cuidar é" (tipo em scrub), tom, espaço, fecho
servicos.html       Quatro frentes em cards empilhados, também no plano, condições (acordeão),
                    método em sete etapas, fecho
mapa-de-scroll.md   O plano: descoberta, mapa seção a seção, storyboard, emendas
assets/css/style.css   Folha única: fontes, tokens, componentes, efeitos em CSS nativo, responsivo
assets/js/scroll.js    Motor de scroll (um rAF) + pipeline, manifesto e "Cuidar é"
assets/js/main.js      Cabeçalho, menu, chegada do hero, gate, links de WhatsApp, formulário,
                       acordeão, índice das camadas, CTA fixo no celular
assets/fonts/          Abril Fatface 400, Abhaya Libre 400 e 700, IBM Plex Mono 400 (woff2, latin)
assets/img/            Fotos reais do espaço em WebP (400, 640 e 960 px), máscara do logotipo, OG
```

## O que o cliente pode trocar sem mexer em efeito

- **Textos**: direto no HTML. Cada seção tem o comentário com o nome dela.
- **Número do WhatsApp**: uma constante em `assets/js/main.js` (`WHATS`, só dígitos com DDI) e o
  texto visível nos rodapés, no menu e na seção de contato. O site usa o número do site anterior,
  (11) 91290-0011; o brandbook traz +55 11 98181-4261. Confirmar qual é o oficial.
- **Mensagem inicial do WhatsApp**: `MSG_BASE` no mesmo arquivo.
- **Objetivos do gate** ("O que você quer voltar, continuar ou começar a fazer?"): os botões
  `.chip` na home. O atributo `data-verbo` liga cada um a um dos seis caminhos (voltar, continuar,
  evoluir, prevenir, performar, viver).
- **Fotos**: trocar os arquivos em `assets/img/` mantendo os três tamanhos e o `width`/`height`.
  O manual pede foto escurecida em 30% antes de texto por cima; as legendas já ficam sobre um
  gradiente. Foto clara sob o logotipo não é permitida.
- **Endereços das casas**: na home (seção "Duas casas"), no rodapé e no formulário.

## Direção visual (do manual)

| | |
|---|---|
| Display | Abril Fatface, só em títulos curtos e números. Nunca em blocos de texto, legendas ou botões |
| Texto | Abhaya Libre 400 e 700 |
| Legenda | IBM Plex Mono 400, caixa alta, `letter-spacing` .18em |
| Escala | 96/100 display · 48/56 título · 20/32 corpo · 14/20 legenda, em `clamp()` |
| Espaço | 4 · 8 · 16 · 24 · 40 · 64 · 96 · 160 |
| Cores | Preto #000000 (fundo padrão) · Névoa #E9F1F0 · Teal Vital #12D6CE (sinal) · Teal escuro #17726d só para texto pequeno sobre névoa, por contraste |
| Grafismo | Par de anéis entrelaçados, interseção de 40% do diâmetro, só contorno, um par por peça, no máximo 60% de opacidade sob texto |
| Botões | Pílula, ação primária em teal com texto preto, secundária em contorno |
| Logotipo | PNG oficial usado como máscara (`.logo`), o que permite branco, teal ou preto sem redesenhar. Nunca sobre foto clara |

## Movimento

Só entra o que passa no teste "se eu tirar, a página perde argumento ou só perde beleza?".

| Efeito | Onde | Como funciona |
|---|---|---|
| **Chegada do hero** | todas | Linhas do título sobem de dentro de uma máscara; os anéis se desenham por `stroke-dashoffset`; saída em parallax por `animation-timeline: view()` |
| **Gate** | home | A pessoa escolhe o que quer voltar a fazer. A escolha fica na sessão, marca o caminho correspondente em "Seis caminhos", pré-preenche o formulário e entra na mensagem de todos os links de WhatsApp |
| **Manifesto palavra a palavra** | home | `<p class="manifesto" data-palavras>`: as palavras acendem conforme o parágrafo atravessa a tela. Sem palco travado |
| **08 · Pipeline** | home | As sete etapas da experiência Good: nó acende, conector se desenha em `scaleX`, a frase de cada etapa entra e sai. Curso de 530vh no desktop (66vh por batida), 400vh no celular. Versão estática em `.pipe__lista` para `prefers-reduced-motion` e sem JS |
| **Tipo em scrub "Cuidar é"** | quem somos | Sete batidas: a linha "Não significa apenas…" entra, o título "Cuidar é…" sobe, os dois saem mais rápido do que entraram. 480vh no desktop, 360vh no celular |
| **40 · Cards empilhados** | serviços | Cada frente gruda um pouco abaixo da anterior com `position: sticky`, em fluxo normal. Vira coluna no celular |
| **42 · Acordeão** | serviços | `grid-template-rows: 0fr → 1fr`, um aberto por vez, `aria-expanded` |
| **Reveals** | todas | `.rise` com `animation-timeline: view()`, escalonado por `data-d`. Sem suporte, o conteúdo simplesmente aparece |
| **Parallax das fotos** | home, quem somos | CSS nativo, a imagem anda 16% dentro da moldura |
| **Transição de página** | todas | View Transitions nível 2: saída em .26s, entrada em .42s |

Regras que o motor segue: um `requestAnimationFrame` para a página inteira; só calcula seções
perto da viewport; uma leitura de layout por elemento por quadro; anima só `transform` e
`opacity`; `overflow-x: clip` no `body` (nunca `hidden`, que quebra o `sticky`).

Tudo é desligado sob `prefers-reduced-motion: reduce`: o pipeline vira lista, "Cuidar é" vira
sete blocos em coluna, títulos aparecem prontos. Há um `<noscript>` em cada página com o mesmo
fallback.

## Conversão

- CTA visível antes do primeiro scroll, com verbo específico: "Agendar avaliação" (nome da ação
  primária no manual, pág. 25).
- Cabeçalho fixo, nunca se esconde. CTA fixo no celular a partir de 40% da página, escondido
  quando a seção de contato está na tela.
- Formulário de etapa única: nome, WhatsApp, objetivo (pré-preenchido pelo gate) e unidade.
  Valida no `blur`, erro abaixo do campo, honeypot, `inputmode` e `autocomplete` certos, inputs
  com 16px ou mais. O envio abre o WhatsApp com a mensagem pronta e mostra um estado de sucesso
  com o primeiro nome e o próximo passo. Nenhum dado fica no site.
- UTM (`utm_source` ou `utm_campaign`) preservado na sessão e anexado à mensagem.
- Seção de limite ("A Good não é para quem procura…") qualifica por exclusão, com o texto do
  próprio manual de tom de voz.
- Sem número inventado: a prova é o que é verificável (duas casas com endereço, o espaço, o
  método).

## Regras de escrita

- Sem travessão. Separador é `·`.
- A antítese "X, não Y" é tempero, não estrutura. A estratégia de discurso usa "Não significa
  apenas X. Cuidar é Y." como figura própria da marca; fora dela, no máximo duas por página.
- Menos procedimento, mais pessoa: toda seção precisa responder "o que estamos ajudando essa
  pessoa a viver?".

## Antes de publicar

1. Confirmar o número de WhatsApp (ver acima).
2. Confirmar Rolfing e Recovery como "também no plano" (o manual fecha em quatro frentes).
3. Fotos de gente vivendo (correndo, brincando, treinando), como a estratégia pede: quando
   existirem, entram no hero e em "Seis caminhos". Hoje o site usa só fotos reais do espaço; as
   imagens geradas por IA do site anterior foram cortadas.
4. Apontar `og:image` para a URL absoluta do domínio.
5. Rodar Lighthouse em modo mobile com 4G e testar num iPhone real (o simulador não reproduz o
   `sticky` do Safari).
