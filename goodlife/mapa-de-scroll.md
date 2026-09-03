# Mapa de scroll · Good Life Health Center

Plano feito antes do código, seguindo a ordem da skill: diagnóstico → mapa → direção visual → CSS nativo → movimento → camadas globais → orçamento → entrega.

## Descoberta

| | |
|---|---|
| Ação única da página | Agendar avaliação pelo WhatsApp (o canal que a clínica já opera) |
| Visitante certo | Pessoa em São Paulo que quer **voltar, continuar ou começar** a fazer algo com o corpo: correr de novo, treinar sem dor, envelhecer com autonomia, performar |
| Visitante a repelir | Quem procura promessa milagrosa, "emagreça 10 kg em 30 dias", pacote fechado de sessões ou alívio do sintoma sem entender a causa |
| Objeção que mata a venda | "É só mais uma clínica com academia anexa" / "vão me prender num tratamento sem fim" |
| Origem do tráfego | Instagram (@goodlifehealthcenter), indicação e busca local |
| Vende coisa ou processo? | **Processo.** Não há objeto para virar herói; a tipografia e o método carregam a página |
| Foto real? | Sim, do espaço (recepção, salas, área de treino). As fotos de "pilares" do site anterior eram geradas por IA e foram cortadas |
| Número verificável + período | **Não existe.** A seção de prova numérica foi cortada. A prova é o que é real: duas casas com endereço, o espaço, o método |
| Nome de cliente autorizado? | Não. Sem depoimentos inventados |
| % de tráfego mobile | Presumido acima de 70% (clínica, Instagram). Curso reduzido no celular |
| Stack / quem mantém | HTML/CSS/JS puro, sem build. Texto e dados editáveis direto no HTML |
| Identidade fechada? | Sim: Brandbook v01 2026 + Estratégia de discurso v01 2026 |

## O que muda em relação ao site anterior

- **Nome da marca**: o site anterior dizia "Good Health Center". O logotipo, o brandbook e a estratégia dizem **Good Life Health Center**.
- **Discurso**: sai "Recuperar lesões, elevar performance e cuidar do corpo com profundidade" (lista de serviços); entra **"Cuidar para viver"** e a primeira mensagem definida na estratégia (pág. 67).
- **Estrutura**: menos procedimento, mais pessoa. A página abre com o que a pessoa quer voltar a fazer, não com o que a clínica oferece.
- **Quatro frentes**, como no brandbook. Rolfing e Recovery, que o site anterior tratava como frentes, viram "também no plano" dentro da página de serviços.
- **Tipografia do manual**: Abril Fatface (display), Abhaya Libre (texto), mono para legenda. Escala 96/100 · 48/56 · 20/32 · 14/20.
- **Paleta do manual**: preto absoluto, névoa, teal vital como sinal. Proporção 60 · 26 · 14.
- **Grafismo**: o par de anéis entrelaçados, único elemento gráfico autorizado. Interseção de 40% do diâmetro, só contorno, um par por peça.
- **Fotos claras sem escurecer** e imagens geradas por IA: fora.

## Direção visual

| | |
|---|---|
| Display | Abril Fatface, só em títulos curtos e números |
| Corpo | Abhaya Libre 400–800 |
| Mono (dado) | IBM Plex Mono 400/500 em rótulos, legendas e números pequenos |
| Escala tipográfica | 96/100 display · 48/56 título · 20/32 corpo · 14/20 legenda, em `clamp()` |
| Escala de espaçamento | 4 · 8 · 16 · 24 · 40 · 64 · 96 · 160 |
| Cor de fundo | Preto #000000 (60%) e Névoa #E9F1F0 (26%) |
| Cor de sinal | Teal Vital #12D6CE. Teal Profundo #2FA39C só em hover e sobre névoa |
| Raio | Botões em pílula (como no manual, pág. 25); cartões em 4px |
| Textura | Grão a 3% sobre o preto |

## Mapa · Home

| # | Seção | Trabalho da seção | Curso | Intensidade | Movimento | Peso |
|---|---|---|---|---|---|---|
| 1 | Hero | "Cuidar para viver." + primeira mensagem + CTA em 3 s | 100vh | forte (na chegada) | 06 tipo em máscara na chegada; anéis se desenhando; saída em parallax CSS | 0 |
| 2 | A chegada (gate) | "Pessoas não chegam procurando uma especialidade." A pessoa escolhe o que quer voltar a fazer | 90vh | média | reveal CSS; escolha alimenta o resto da página | 0 |
| 3 | Manifesto | "Cuidamos de alguém que precisa daquele corpo para viver." palavra a palavra | 150vh | média | acende por scroll (JS leve, sem sticky) | 0 |
| 4 | Seis caminhos | Voltar · Continuar · Evoluir · Prevenir · Performar · Viver; o escolhido fica marcado | 90vh | quieta | reveal CSS | 0 |
| 5 | Quatro frentes | Fisio, preparação, medicina e nutrição como conhecimentos para a mesma pessoa | 100vh | quieta | reveal CSS; pictogramas SVG | 0 |
| 6 | A experiência Good | Sete etapas: uma sequência, não um pacote | 530vh | forte | 08 pipeline (JS, o único efeito pesado) | 0 |
| 7 | Cuidado + limite | Cuidado como padrão de entrega; para quem a Good não serve | 110vh | quieta | reveal CSS | 0 |
| 8 | Casas e espaço | Duas unidades reais; fotos reais do espaço | 110vh | quieta | parallax leve em CSS | ~420 KB |
| 9 | Fecho | "Você não precisa descobrir sozinho o próximo passo." Formulário que abre o WhatsApp já preenchido | 100vh | média | reveal CSS | 0 |
| | **Total** | | **~1380vh** desktop · **~1050vh** celular | | **2 efeitos JS** (pipeline + manifesto) | **~420 KB** |

### Validação

- [x] Curso total dentro da faixa (home institucional, não landing única; celular a ~75%)
- [x] Nenhuma "forte" encostada em outra "forte" (hero → gate média; pipeline entre duas quietas)
- [x] 2 efeitos de espetáculo, 1 da faixa média (pipeline); zero da faixa alta
- [x] 1 seção travada (pipeline)
- [x] CTA visível na seção 1, antes do primeiro scroll
- [x] Seção de limite existe (7)
- [x] Prova sem número inventado: cortada a métrica, mantido o que é verificável
- [x] Peso cabe: ~420 KB de foto, ~9 KB de JS, duas famílias de fonte

### Leitura em voz alta da coluna "trabalho"

Cuidar para viver → a pessoa chega porque algo importa para ela → cuidamos de alguém que precisa do corpo para viver → seis caminhos possíveis → quatro conhecimentos para a mesma pessoa → o método em sete etapas → cuidado como padrão e para quem não serve → onde estamos → o próximo passo. É um argumento.

## Storyboard · Seção 6, A experiência Good (08 pipeline, 530vh)

Sete nós: Escutar · Avaliar · Planejar · Integrar · Acompanhar · Evoluir · Autonomia. Fatia de 12,5% por nó a partir de 6%. Cerca de 66vh por batida, acima do piso porque cada batida é um nó que acende mais uma linha de texto.

```
0%     Título "A experiência Good" legível; sete nós em contorno apagado; conectores invisíveis
6%     Nó 01 Escutar: anel escala de .75 → 1 e preenche; a frase "Entender a pessoa antes de definir o caminho." entra de baixo
11%    Conector 01→02 se desenha (scaleX 0 → 1)
18,5%  Nó 02 Avaliar acende; frase troca (a anterior sai mais rápido do que a nova entra)
...    mesma batida a cada 12,5%
81%    Nó 07 Autonomia acende em teal cheio; frase "Devolver confiança e possibilidades."
93%    Todos acesos; legenda "Uma sequência, não um pacote: cada etapa alimenta a próxima." entra
100%   Estado final estável; a seção seguinte começa em preto, mesma cor
```

Sem movimento (`prefers-reduced-motion`): os sete nós e as sete frases visíveis, conectores completos.

## Mapa · Quem Somos

| # | Seção | Trabalho | Curso | Intensidade | Movimento |
|---|---|---|---|---|---|
| 1 | Hero | "Diferentes especialidades. Um mesmo cuidado. A sua vida no centro." | 100vh | forte (chegada) | máscara + anéis |
| 2 | Essência | Não somos uma clínica com academia anexa; missão, visão, valores | 110vh | quieta | reveal |
| 3 | Cinco camadas | Pessoa · Ciência · Equipe · Cuidado · Autonomia | 260vh | média | índice travado + scroll-spy |
| 4 | Cuidar é | Sete batidas: "Não significa apenas tratar. Cuidar é compreender." até "Para viver." | 480vh | forte | tipo em scrub (JS) |
| 5 | Tom | Seis adjetivos; o que queremos e não queremos ser | 100vh | quieta | reveal |
| 6 | O espaço | Fotos reais | 110vh | quieta | parallax CSS |
| 7 | Fecho | CTA para avaliação | 80vh | média | reveal |

## Mapa · Serviços

| # | Seção | Trabalho | Curso | Intensidade | Movimento |
|---|---|---|---|---|---|
| 1 | Hero | "As especialidades mudam. O cuidado continua." | 100vh | forte (chegada) | máscara + anéis |
| 2 | Integração | Integração não é ter vários profissionais no mesmo endereço | 80vh | quieta | reveal |
| 3 | Quatro frentes | Um cartão por frente, com o que inclui e para quem | 4 × 85vh | média | 40 cards empilhados (CSS sticky) |
| 4 | Também no plano | Rolfing e Recovery | 70vh | quieta | reveal |
| 5 | Condições | Lista por área | 100vh | quieta | 42 acordeão |
| 6 | Método | As sete etapas em lista compacta | 80vh | quieta | reveal |
| 7 | Fecho | CTA | 80vh | média | reveal |

## Emendas

| De | Para | Emenda |
|---|---|---|
| Hero (preto) | Gate (preto) | cor |
| Gate | Manifesto (preto) | cor; o gate termina com "alguma coisa importa para elas" e o manifesto começa por "Cuidamos de alguém" |
| Manifesto | Seis caminhos (névoa) | corte de capítulo deliberado, com respiro de 96px |
| Seis caminhos | Quatro frentes (névoa) | cor |
| Quatro frentes | Pipeline (preto) | posição: o título do pipeline entra onde a frase de integração terminou |
| Pipeline | Cuidado e limite (preto) | cor |
| Cuidado e limite | Casas (névoa) | respiro |
| Casas | Fecho (preto) | cor |

## Camadas globais

- Cabeçalho fixo (conversão): transparente no topo, preto com desfoque ao rolar. Nunca se esconde.
- Menu em tela cheia com cortina circular a partir do botão; trava o scroll, `inert` no resto, `Esc` fecha, foco devolvido.
- Transição de página: View Transitions nível 2 (cortina direcional). Sem animação sob `prefers-reduced-motion`.
- Barra de progresso em CSS puro (`animation-timeline: scroll()`).
- Micro-estados: hover sobe 2px, `:active` desce 1px, `:focus-visible` teal.
- Formulário: valida no `blur`, erro abaixo do campo, honeypot, `inputmode` certo, 16px nos inputs, objetivo pré-preenchido pelo gate, UTM preservado na mensagem.
- CTA fixo no celular a partir de 40% da página.

## O que o cliente precisa confirmar

1. **Telefone**: o site anterior usa (11) 91290-0011; o brandbook usa +55 11 98181-4261. O site novo está com o número do site anterior. Trocar em um lugar só (`assets/js/main.js`, constante `WHATS`).
2. **Rolfing e Recovery** como "também no plano" (o brandbook fecha em quatro frentes).
3. **Fotos de gente vivendo** (correndo, brincando, treinando), como a estratégia pede na pág. 60. As fotos atuais são do espaço. Quando existirem, entram no hero e na seção "Seis caminhos".
4. **Horário de funcionamento** das duas casas, se quiser publicar.
