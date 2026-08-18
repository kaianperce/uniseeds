# Mídia do site — o que produzir e em que formato

Coloque os arquivos nesta pasta com estes nomes. Enquanto não existirem, o site usa
a geometria da marca como substituta e continua funcionando.

## Vídeo do hero — `hero.mp4` + `hero.webm` + `hero.jpg`

| Item | Especificação |
| --- | --- |
| Duração | 6 a 10 s, em **loop perfeito** (o último quadro tem de casar com o primeiro) |
| Resolução | 1920×1080 entregue, exibido em ~720p — o hero é pequeno |
| Formatos | `hero.mp4` (H.264) e `hero.webm` (VP9) — o navegador escolhe o menor |
| Peso alvo | **até 2 MB**. Acima disso, corte a duração antes de baixar a qualidade |
| Áudio | **remover a faixa** — o vídeo roda mudo e a trilha só pesa |
| Poster | `hero.jpg`, o primeiro quadro, até 200 KB — é o que aparece antes do vídeo carregar |
| Enquadramento | assunto no centro; as bordas serão cortadas em telas estreitas |

Comando de compressão (ffmpeg):

```bash
ffmpeg -i original.mov -t 8 -an -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart hero.mp4
ffmpeg -i original.mov -t 8 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 hero.webm
ffmpeg -i hero.mp4 -frames:v 1 -q:v 3 hero.jpg
```

## Imagens de apoio

| Uso | Arquivo | Tamanho | Peso |
| --- | --- | --- | --- |
| Capa de case / portfólio | `case-01.webp`… | 1600×1000 (16:10) | até 250 KB |
| Retrato da equipe | `time-01.webp` | 1200×1500 (4:5) | até 200 KB |
| Prova social / print de resultado | `prova-01.webp` | 1400×900 | até 200 KB |
| Compartilhamento em redes | `og.jpg` | 1200×630 | até 300 KB |

Formato: **WebP** para tudo que é foto (30–40% menor que JPG na mesma qualidade),
com JPG só no `og.jpg` porque alguns previews de rede social ainda engasgam com WebP.

```bash
cwebp -q 78 foto.jpg -o case-01.webp
```

## O que NÃO precisa de arquivo nenhum

Estes efeitos do site são desenhados em código e não consomem mídia:
geometria do hero, faixa 45°, marquee, transições entre páginas, manifesto que acende
palavra a palavra, painéis empilhados do método e o filete de marca sobre as imagens.

## Regras de peso

A página inteira deve caber em **2,5 MB** no primeiro carregamento (hoje está em ~30 KB,
sem mídia). Vídeo no hero é o item mais caro do orçamento: se ele passar de 2 MB,
troque por uma imagem com o zoom de scroll — o efeito é quase o mesmo e custa 10× menos.
