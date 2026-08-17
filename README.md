# KP Media — site institucional

Site estático da agência KP Media, em HTML/CSS/JS com uma camada de motion
(GSAP + ScrollTrigger + SplitText + Lenis, hospedados localmente em `assets/vendor/`),
seguindo os tokens do Manual de Marca v1.0 — proporção 60% preto · 20% ciano · 15% rosa · 5% apoio —
e o plano de `arquiteturasitekpmedia.md`.

## Rodar

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura (mapa da arquitetura)

```
index.html             Home — hero, pilares, serviços, cases em scroll horizontal, prova social, CTA
servicos.html          As três frentes em profundidade: problema, incluso, primeiros 30 dias, case ligado
cases.html             Índice de cases (número na frente)
cases/clinicas.html    Case individual — saúde            ← conteúdo demonstrativo
cases/saas.html        Case individual — SaaS B2B         ← conteúdo demonstrativo
cases/educacao.html    Case individual — educação         ← conteúdo demonstrativo
sobre.html             Manifesto expandido, método em etapas, time, FAQ, dados da empresa
contato.html           Formulário curto + aviso LGPD com link para a política
privacidade.html       Política de privacidade (LGPD)     ← obrigatória
cookies.html           Política de cookies (LGPD/ANPD)    ← obrigatória
metodo.html            Redirect para sobre.html (rota antiga)
assets/css/style.css   Folha única: tokens, componentes, motion, responsivo
assets/js/main.js      Transições, GSAP/Lenis, reveals, consentimento de cookies, formulário
assets/vendor/         gsap, ScrollTrigger, SplitText (grátis desde a liberação da Webflow), lenis (MIT)
```

## Transições e movimento

| Efeito | Onde | Como funciona |
| --- | --- | --- |
| **Cortina diagonal 45°** | todas | a cortina inteira gira −45° (grafismo do corte do k) e as lâminas com borda colorida varrem a tela em cascata na troca de página |
| **Scroll suave** | global (desktop) | Lenis integrado ao ticker do GSAP |
| **Texto que se monta** | só H1 e H2 | SplitText divide depois da renderização (SEO preservado); hero por caracteres, seções por palavras via ScrollTrigger |
| **Scroll horizontal dos cases** | home | seção pinada com scrub (ScrollTrigger); em touch/mobile/reduced-motion vira rolagem nativa com scroll-snap |
| **Parallax** | arte do hero | via ScrollTrigger quando o GSAP está presente; fallback vanilla |
| **Preloader** | home | barra + contador, uma única vez por sessão (`sessionStorage`) |
| **Reveals, contadores, marquee 45°, botões magnéticos, cursor da marca** | várias | vanilla; cursor só em `(hover:hover) and (pointer:fine)` |

Regras aplicadas: efeito nunca segura conteúdo (texto renderiza primeiro), tudo respeita
`prefers-reduced-motion: reduce`, e há `<noscript>` em cada página removendo cortina/preloader/banner.
Sem GSAP (falha de carregamento), o site inteiro continua funcional com os fallbacks vanilla.

## LGPD e acessibilidade

- **Banner de cookies** conforme orientação da ANPD: aceitar e recusar com o mesmo destaque,
  nada pré-marcado, não essenciais **bloqueados até o aceite**, revogação pelo rodapé
  ("Gerenciar cookies"). O consentimento fica em `localStorage` (`kp:consent:v1`).
- Os snippets de GA4/pixel entram **dentro** de `carregarAnalytics()`/`carregarAds()` no
  `main.js` — nunca soltos no HTML, ou rodariam antes do consentimento.
- Contraste: branco sobre rosa (3,67:1) reprovava nos botões — decisão aplicada: **ciano é a
  ação primária** (preto sobre ciano, 14,12:1); o rosa segue em detalhes, pontuação e grafismos.
- Skip-link, `:focus-visible`, um H1 por página, títulos/descrições próprios por case.

## Pontos de atenção antes de publicar

- **Cases e depoimentos são demonstrativos** (marcados com comentário no HTML). Trocar por
  dados reais, confirmados e autorizados — ou manter a anonimização por segmento com
  variação percentual, como previsto na arquitetura.
- **Dados da empresa**: razão social, CNPJ e endereço estão como placeholder em `sobre.html`,
  no rodapé e na política de privacidade. Sem isso o site não vai ao ar.
- **Time**: nomes/fotos placeholder em `sobre.html`.
- **Logotipo**: o monograma `kp` está desenhado em fonte (`.logo`), o que o manual proíbe.
  Trocar pelo SVG oficial antes de ir ao ar — o favicon também é placeholder.
- **Formulário**: não há back-end. O `submit` monta um `mailto:` preenchido.
  Para captar leads de verdade, apontar o `<form>` para um endpoint.
- **Links sociais e WhatsApp** estão como `#`.
- A tipografia oficial (All Round Gothic) tem fallback em Poppins; se houver licença webfont,
  hospedar local e usar só os dois pesos do manual.
- Adicionar `LocalBusiness` ao JSON-LD da home quando houver endereço real.
