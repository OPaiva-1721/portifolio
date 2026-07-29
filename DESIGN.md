---
name: Gabryel Paiva Neves — Portfólio
description: Carreira lida como histórico de commits, em vidro líquido sobre um terminal escuro.
colors:
  bg-void: "#0D1117"
  surface-panel: "#161B22"
  text-primary: "#C9D1D9"
  amber-signal: "#E3B341"
  mint-diff: "#7EE2B8"
  lilac-role: "#D2A8FF"
  border-subtle: "#2A3138"
  ink-on-amber: "#17130A"
  cv-paper: "#FFFFFF"
  cv-ink: "#1B1F24"
  cv-dim: "#57606A"
  cv-line: "#D8DEE4"
  cv-amber: "#9A6B00"
  cv-mint: "#0F7B56"
  cv-lilac: "#6B3FA0"
  recess-overlay: "rgba(0,0,0,0.2)"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.2rem, 7vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  scale:
    cv-micro: "0.62rem"
    cv-supporting: "0.68rem"
    status-pill: "0.7rem"
    cv-eyebrow: "0.72rem"
    cv-contact: "0.74rem"
    meta: "0.78rem"
    cv-detail: "0.8rem"
    dense-body: "0.9rem"
    brand: "0.95rem"
    lede: "1.05rem"
    section-label: "1.1rem"
    subtitle: "1.15rem"
    cv-name: "1.5rem"
rounded:
  hairline: "2px"
  chip: "4px"
  control: "6px"
  panel-sm: "10px"
  panel-md: "12px"
  panel-lg: "14px"
  panel-xl: "16px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "3rem"
  section-y: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.amber-signal}"
    textColor: "{colors.ink-on-amber}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.3rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.3rem"
  tag:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.mint-diff}"
    rounded: "{rounded.chip}"
    padding: "0.25rem 0.6rem"
---

# Design System: Gabryel Paiva Neves — Portfólio

## Overview

**Creative North Star: "O Log do Turno da Noite"**

O portfólio lê a carreira de Gabryel como um histórico de commits visto tarde da noite: fundo quase preto (#0D1117, o mesmo tom de base do GitHub no modo escuro), um vídeo em loop ao fundo, e painéis de vidro líquido flutuando por cima como janelas de um editor de código aberto às 2h da manhã. Cada seção se anuncia como um caminho de terminal (`~/sobre`, `~/contato`), o hero abre com `$ whoami`, e a experiência profissional é literalmente formatada como uma linha do tempo de commits com hash, escopo, diffs de adição e stack.

A superfície é técnica mas não fria: o vidro fosco (estilo iOS/visionOS, com brilho especular que segue o cursor) suaviza o rigor de terminal, e os três acentos de cor — âmbar, menta, lilás — têm papéis fixos e legíveis como sintaxe: âmbar sinaliza atenção e ação (CTA, cursor, labels de seção), menta confirma como uma linha de diff adicionada (hashes, ícones, tags), lilás identifica papéis e pessoas (cargos, nomes de contato). Nenhuma paleta de terceiros nem gradientes decorativos soltos; cada cor tem um trabalho a fazer.

Nenhuma rejeição visual confirmada além da atual: a versão `/#cv` deliberadamente abandona o vidro e o fundo escuro por um layout de página impressa, clara e sóbria, porque o CV precisa imprimir bem e ser lido fora do contexto do site.

**Key Characteristics:**
- Fundo quase-preto estilo GitHub dark + vídeo em loop com scrim gradiente, nunca um fundo sólido plano.
- Painéis translúcidos (vidro líquido) com blur 20–28px, saturação ~180–190%, borda superior mais clara que simula luz vinda de cima.
- Três acentos de cor com papel fixo (âmbar = sinal, menta = confirmação, lilás = papel/pessoa), nunca intercambiáveis.
- Rótulos, hashes e navegação sempre em monoespaçada (JetBrains Mono); títulos em Space Grotesk; corpo em IBM Plex Sans.
- A metáfora de terminal/git é estrutural, não decorativa: aparece em copy (`$ whoami`, `~/seção`), em componentes (cards de projeto como abas de editor), em dados (experiência como "commits") e, no hero, num prompt de verdade que aceita comandos digitados.

## Colors

A paleta principal replica o modo escuro do GitHub como base neutra e soma três acentos com papel de sintaxe fixo; uma segunda paleta, clara, existe só para a página de currículo impressa.

### Primary
- **Âmbar-Sinal** (`#E3B341`): o acento de ação. Cursor piscando no hero, CTA primário, labels de seção (`~/sobre`), hash "HEAD" do commit atual, hover de links de navegação. É a cor que diz "olhe aqui" ou "isto está ativo agora".

### Secondary
- **Menta-Diff** (`#7EE2B8`): confirmação, como uma linha adicionada num diff. Hash de cada commit de experiência, ícones de contato, texto das tags/stack, linhas `diff-add`. Nunca usada para alertar ou chamar atenção — é leitura positiva, não convite à ação.

### Tertiary
- **Lilás-Papel** (`#D2A8FF`): identifica papéis e pessoas. O cargo dentro de cada commit de experiência (`commit-role`), o placeholder-tag de campos incompletos. Reservada para "quem" e "o que ainda falta preencher", nunca para ação ou confirmação.

### Neutral
- **Vazio-Terminal** (`#0D1117`): fundo base de toda a landing — o mesmo tom do GitHub dark, escolhido para que o vídeo e os painéis de vidro tenham algo realmente escuro por trás.
- **Painel-Superfície** (`#161B22`): fundo de elementos sólidos não-glass, como as tags de stack e o bloco de diff.
- **Texto-Primário** (`#C9D1D9`): cor de todo o corpo de texto sobre fundo escuro; nunca branco puro, para não vibrar contra o vídeo.
- **Borda-Sutil** (`#2A3138`): divisórias e bordas de baixo contraste (botão ghost, tags, divisor do menu mobile).
- **Tinta-sobre-Âmbar** (`#17130A`): único texto escuro do sistema, usado apenas dentro do botão primário âmbar para manter contraste AA.
- **Recesso-Overlay** (`rgba(0,0,0,0.2)`): preto translúcido usado só pra afundar visualmente uma sub-área dentro de um painel de vidro já translúcido (fundo do bloco `.diff`, cabeçalho `.project-tabbar`) — não é uma cor de marca, é um recurso físico de profundidade.

### Print / CV (secundário, escopo `.cv-page`)
- **Papel-CV** (`#FFFFFF`) / **Tinta-CV** (`#1B1F24`): fundo e texto base da versão imprimível, invertendo a landing (clara em vez de escura) porque a página é feita para impressão, não para tela.
- **Âmbar-CV** (`#9A6B00`), **Menta-CV** (`#0F7B56`), **Lilás-CV** (`#6B3FA0`): as mesmas três cores-função reescuras/saturadas o suficiente para manter contraste legível em fundo branco — mesma sintaxe, adaptada ao papel.
- **Linha-CV** (`#D8DEE4`) / **Dim-CV** (`#57606A`): divisórias e texto secundário (datas, instituição) no CV.

### Named Rules
**A Regra da Sintaxe Fixa.** Âmbar, menta e lilás nunca trocam de papel entre componentes: âmbar é sempre sinal/ação, menta é sempre confirmação, lilás é sempre papel/pessoa. Um novo componente que precise de "mais uma cor de destaque" reutiliza um desses três papéis em vez de introduzir uma quarta cor.

## Typography

**Display Font:** Space Grotesk (fallback: sans-serif)
**Body Font:** IBM Plex Sans (fallback: sans-serif)
**Label/Mono Font:** JetBrains Mono (fallback: monospace)

**Character:** Space Grotesk dá ao nome e aos títulos de commit um peso geométrico e levemente técnico sem virar display-font decorativa; IBM Plex Sans carrega o corpo com neutralidade legível; JetBrains Mono assina cada elemento que deveria "parecer código" — rótulos, caminhos, hashes, tags.

### Hierarchy
- **Display** (700, `clamp(2.2rem, 7vw, 4.5rem)`, altura de linha 1.1): nome no hero (`hero-name`), os únicos lugares em Space Grotesk pesado e fluido. O cabeçalho do CV (`cv-head h1`) reusa o mesmo peso/família num degrau fixo menor (`cv-name`, 1.5rem) — impressão não tem viewport pra clampar.
- **Headline** (600, 1.15rem, Space Grotesk): título de cada commit de experiência (`commit-msg`).
- **Title** (600, ~1.05rem): rótulo `~/seção` (`section-label`, 1.1rem — o único degrau entre Title e Headline) e título de card de projeto (`project-body h3`, `.bio`).
- **Body** (400, 1–1.15rem, IBM Plex Sans): bio, subtítulo do hero, descrições de projeto; sem limite de linha fixo declarado, mas os contêineres já restringem a ~560–700px.
- **Label** (500–600, 0.7–0.95rem, JetBrains Mono, caixa normal exceto CV): labels de seção (`~/sobre`), links de nav, hashes, tags de stack, datas.

### Scale Steps (metadado denso)

Abaixo do nível "Label" existe uma escala mais fina de tamanhos, real e reutilizada, para texto de suporte — sobretudo na densidade maior do CV impresso. Nomes em `typography.scale` no frontmatter:

| Nome | Valor | Onde aparece |
|---|---|---|
| `brand` | 0.95rem | `tabbar-brand`, `hero-eyebrow`, `.btn` |
| `dense-body` | 0.9rem | menu mobile, `project-body p`, corpo do CV (`cv-sheet`) |
| `cv-detail` | 0.8rem | botões/links do CV, instituição, footer, `@media print` |
| `meta` | 0.78rem | `commit-meta`, `role-date`, `.tag`, `project-filename`, escopo/cargo/projeto no CV |
| `cv-contact` | 0.74rem | links de contato do CV |
| `cv-eyebrow` | 0.72rem | títulos de seção do CV (uppercase, tracked) |
| `status-pill` | 0.7rem | texto dentro de `head-tag`/`root-tag` |
| `cv-supporting` | 0.68rem | tags, listas e parágrafos de suporte do CV |
| `cv-micro` | 0.62rem | datas e links de projeto no CV — menor tamanho do sistema |

### Named Rules
**A Regra do Mono-para-Metadado.** Qualquer texto que seja metáfora de sistema/terminal — caminho, hash, data, rótulo, tag — vai em JetBrains Mono. Texto de conteúdo humano (bio, descrições) nunca usa mono.

## Layout

Container central com `max-width: 900px` (`.section`, `.hero-inner`) para todo o corpo de texto; o hero ocupa `min-height: 100vh` para abrir a página em tela cheia antes do scroll revelar o changelog. Padding vertical de seção generoso (`5rem`) cria o ritmo de "um commit por vez" ao rolar. O grid de projetos usa `repeat(auto-fit, minmax(240px, 1fr))` — colunas fluidas sem breakpoint fixo. Abaixo de 640px o nav de texto vira hambúrguer (medido: precisa de ~448px de largura para o menu horizontal, não cabe antes disso). O vídeo de fundo é pulado em telas ≤480px ou com "economia de dados" ligada, caindo para o poster estático — nunca há salto visual porque o poster é o mesmo frame do vídeo.

A página de CV (`/#cv`) é um layout completamente separado: folha centralizada (`max-width: 780px`) com sidebar de 34% (skills/contato/certificações) e coluna principal de 66% (formação/experiência/projetos), pensada para impressão A4 (`@page { size: A4; margin: 0.4in; }`), não para a mesma grade da landing.

## Elevation & Depth

O sistema é construído em vidro líquido, não em sombras planas de UI convencional: todo painel relevante (hero, nav, cards de projeto, cards de commit, itens de contato) é uma superfície translúcida com `backdrop-filter: blur() saturate()`, borda de 1px quase invisível que fica mais clara no topo (simulando luz vinda de cima), e uma combinação de sombra externa suave + dois insets de brilho. Painéis "parados" (hero, commit, contato) usam blur mais pesado (28px, saturação 190%) porque não repintam durante o scroll; painéis que se movem ou entram/saem da viewport (nav fixo, cards de projeto) usam blur mais leve (20px, saturação 180%) e são isolados via `contain: paint` + `translateZ(0)` para não pesar no scroll.

### Shadow Vocabulary
- **Vidro-parado** (`box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.04)`): hero, commit, contato — a sombra "de descanso" de qualquer painel que não se move.
- **Vidro-em-movimento** (`box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)`): nav e cards de projeto — mesma sombra externa, brilho interno mais discreto.
- **Spotlight-hover** (`radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.22), transparent 45%)`): brilho especular que só acende no hover, seguindo a posição do cursor via custom properties `--mx`/`--my` atualizadas em JS — exclusivo do nav e dos cards de projeto.

### Named Rules
**A Regra do Vidro-Sempre-Ligado.** Nenhum painel estrutural (hero, nav, commit, project-card, contato) fica sem o par blur+saturate+borda-clara-no-topo; um card "chapado" quebraria a leitura de vidro líquido do sistema inteiro.

## Shapes

Raios crescem com o tamanho/prominência do painel, não seguem uma escala matemática única: chips e tags usam 4px (`chip`), controles/botões usam 6px (`control`), o item de contato usa 10px, o card de commit 12px, o card de projeto 14px e o painel do hero 16px (`panel-sm` → `panel-xl`). Tags de status (`head-tag`, `root-tag`) usam `border-radius: 999px` (pílula completa). As três barras do ícone de hambúrguer mobile usam um raio próprio, quase imperceptível (`hairline`, 2px) — só pra tirar a aresta viva do retângulo, não uma superfície com identidade de vidro. O card de commit tem uma assinatura própria, já intencional e registrada aqui: borda esquerda sólida de 3px em âmbar, como um marcador de linha alterada num diff — nenhum outro componente usa borda lateral colorida.

## Components

### Buttons
- **Shape:** raio `control` (6px).
- **Primary:** fundo âmbar-sinal, texto tinta-sobre-âmbar (`#17130A`) para contraste; padding `0.7rem 1.3rem`.
- **Hover / Focus:** eleva 2px (`translateY(-2px)`), sem mudança de cor.
- **Ghost:** transparente com borda 1px borda-sutil e texto texto-primário; no hover, borda e texto viram âmbar-sinal.

### Chips / Tags
- **Style:** fundo painel-superfície, borda 1px borda-sutil, texto menta-diff, mono, raio `chip` (4px).
- **Placeholder tag:** variante tracejada em lilás-papel — sinaliza campo de conteúdo ainda não preenchido (`bio.stack` com `[...]`, por exemplo).
- **Status pill:** fundo âmbar a 15% de opacidade, borda âmbar a 35%, texto âmbar, raio total (`pill`) — usado só para a tag "Atual" do emprego em andamento.

### Cards / Painéis de Vidro
- **Corner Style:** varia por papel — ver Shapes (10–16px conforme o painel).
- **Background:** vidro líquido translúcido sobre `surface-panel`/`bg-void` (ver Elevation & Depth); nunca uma cor sólida chapada.
- **Shadow Strategy:** ver Elevation & Depth — vidro-parado ou vidro-em-movimento conforme o painel se move na tela.
- **Border:** 1px branco translúcido, mais claro no topo.
- **Internal Padding:** 1.25–1.75rem conforme o card.

### Inputs / Fields
Não há campos de formulário no projeto hoje — todo o contato é feito por links diretos (email/GitHub/WhatsApp). Nenhum padrão de input a documentar; se um formulário for adicionado, herdar o vocabulário de borda-sutil + foco em âmbar-sinal já estabelecido nos outros componentes interativos.

### Navigation
Barra fixa no topo em vidro-em-movimento, links mono a 70% de opacidade que sobem para 100% + âmbar no hover, com sublinhado de 2px que acompanha a cor. Abaixo de 640px vira botão hambúrguer (as três barras se tornam um X em âmbar quando aberto) com dropdown vertical de vidro.

### Commit Card (componente-assinatura)
Cada emprego é renderizado como um commit real de Git: borda esquerda de 3px âmbar, hash em menta, `scope` (nome da empresa) em âmbar, cargo em lilás, datas em mono, e cada responsabilidade formatada como uma linha `+ adicionado` dentro de um bloco `.diff` de fundo escuro monoespaçado. Quando uma empresa tem mais de um cargo ao longo do tempo, os cargos viram `role-entry` dentro do MESMO card, separados só por uma linha divisória — nunca um novo card por cargo.

### Project Card (componente-assinatura)
Cada projeto é um card de vidro-em-movimento com um cabeçalho que imita a aba de um editor de código: uma bolinha (`project-dot`) + nome de arquivo fictício (`barber-foundation.dart`, `orcamento-v2.ts`) em opacidade reduzida, como se o projeto fosse literalmente um arquivo aberto no editor. Abaixo, título em Space Grotesk, descrição em corpo, e as tags de stack. O spotlight especular acende no hover seguindo o cursor.

### Terminal Prompt (componente-assinatura)
Depois da intro animada do hero (`$ whoami`), um prompt `$` real e digitável aparece no mesmo painel de vidro — não é mais só a *aparência* de um terminal, é um. Aceita um vocabulário curto de comandos (`cd <seção>`, `whoami`, `cat curriculo`, `ls`, `help`, `clear`) mais alguns easter eggs não documentados no `help` (`git log`, `sudo hire gabryel`, `pwd`) — a graça de um easter egg é ele não estar no manual. Comando reconhecido devolve uma linha em menta (mesma cor de confirmação usada em todo o sistema); comando não reconhecido tenta sugestão por distância de edição e, sem match, cai num "command not found" em texto dim, nunca numa cor de erro nova. Uma sugestão de `cd` nunca navega sozinha — deixa o comando pronto no input e exige um Enter a mais pra confirmar. Setas pra cima/baixo repetem comandos anteriores, como um shell de verdade. Uma dica única (não repetível) "digita" a palavra `help` no placeholder logo que a intro do hero termina, pra quem não percebe de cara que o campo é digitável — pulada inteiramente com `prefers-reduced-motion`. Foco por teclado usa o mesmo anel âmbar do resto do sistema (`.terminal-prompt:focus-within`), nunca o outline nativo do navegador. O prompt é estritamente aditivo: nav, scroll e os CTAs do hero continuam sendo a forma primária de navegar — digitar é para quem quer, nunca a única forma de usar o site.

## Do's and Don'ts

### Do:
- **Do** manter as três cores de acento com papel fixo: âmbar para ação/sinal, menta para confirmação, lilás para papel/pessoa (A Regra da Sintaxe Fixa).
- **Do** usar JetBrains Mono para qualquer metadado de sistema (caminho, hash, data, rótulo, tag) e nunca para texto de conteúdo humano (A Regra do Mono-para-Metadado).
- **Do** dar a todo painel estrutural novo o tratamento de vidro líquido (blur + saturate + borda clara no topo + sombra vidro-parado/em-movimento conforme se move) — A Regra do Vidro-Sempre-Ligado.
- **Do** manter a metáfora terminal/git presente na copy de qualquer seção nova (`~/seção`, `$ comando`), não só no CSS.
- **Do** preservar o layout de CV (`/#cv`) como uma superfície clara e separada, otimizada para impressão A4, mesmo quando a landing mudar.
- **Do** manter o Terminal Prompt aditivo: qualquer comando novo precisa ter um caminho equivalente por clique/scroll — nunca a única forma de fazer algo no site.

### Don't:
- **Don't** introduzir uma quarta cor de acento decorativa; reutilize âmbar/menta/lilás pelo papel que já carregam.
- **Don't** usar sombra plana convencional de UI (`box-shadow` sólido sem blur/saturate) num painel estrutural — quebra a leitura de vidro líquido do sistema.
- **Don't** aplicar o tema escuro/vidro à página de CV, nem o tema claro de CV à landing; são dois mundos deliberadamente separados.
- **Don't** inventar métricas, depoimentos ou clientes na copy dos cards de projeto/commit — todo o conteúdo é factual (herdado de PRODUCT.md).
