# Handoff — painel de administração

Branch: `feat/painel-admin`. Este documento existe para retomar o trabalho em
outra sessão ou outra máquina. O ledger de execução vive em
`.superpowers/sdd/2026-09-09-admin-login-cms/progress.md`, que é ignorado pelo
git e **não vem no push** — o que importa dele está resumido aqui.

## O que está sendo construído

Um painel em `/#admin`, protegido por senha, que edita todo o conteúdo textual
do site e publica as alterações como um commit no próprio repositório. A Vercel
rebuilda e o site atualiza em cerca de um minuto.

Documentos:

- Design (o porquê e as decisões): `docs/superpowers/specs/2026-09-09-admin-login-cms-design.md`
- Plano de implementação (as 14 tasks, com o código): `docs/superpowers/plans/2026-09-09-admin-login-cms.md`

## Decisões de produto já fechadas

| Questão | Decisão |
|---|---|
| Escopo | Todo o texto de `content.js`. Mídia ficou de fora. |
| Destino da edição | Commit no repositório; a Vercel rebuilda (~1 min). |
| Autenticação | Senha única, só o autor. |
| Interface | Painel próprio em `/#admin`. |
| Operações | CRUD completo: criar, editar, remover, reordenar. |
| Commits | Alterações acumulam num rascunho; um botão publica tudo num commit. |
| Rate limiting | Sem Vercel KV. Senha longa de gerenciador é a defesa principal. |

## Progresso

| Task | Commit | Estado |
|---|---|---|
| 1 · Vitest + teste de caracterização | `1a5ed26` | revisão limpa |
| 2 · Migração para `content.json` | `e8e2341` | revisão limpa |
| 3 · Campo `showInCv` no currículo | `4dcf418` | 1 achado adjudicado — ver Decisão 4 |
| 4 · Validador de conteúdo | `fd5586e` + `9a91c9d` | revisão aprovada; 1 achado corrigido |
| 5–14 | — | não iniciadas |

Para retomar: leia a Task 5 no plano e siga os passos. Cada task termina num
commit próprio. A suíte está em 26 testes passando e o lint limpo.

A Task 4 mereceu uma rodada de correção: o validador ficou correto de primeira,
mas `emptyEducation()` era a única das quatro construtoras de item sem teste — o
próprio plano tinha omitido, e o implementador reproduziu a omissão fielmente. O
commit `9a91c9d` fechou essa lacuna.

## Decisões tomadas durante a execução

Estas foram decisões minhas, não suas. Se discordar de alguma, o custo de
reverter está anotado.

**Decisão 1 — restrição global ampliada.** O plano dizia que `Curriculo.jsx` era
o único arquivo existente com alteração autorizada, mas a Task 10 também altera
`App.jsx` e `ErrorBoundary.jsx`. Ampliei a restrição para nomear os três e o
motivo de cada um, em vez de afrouxá-la. Custo se errado: um revisor aprova
mudança em componente público que deveria ter sido barrada.

**Decisão 2 — `useDraft` enxugado.** O plano fazia o hook devolver uma função
`clearStored` que nenhum consumidor chama. Removi do retorno; a função continua
interna. Custo se errado: se uma task futura precisar limpar o rascunho de fora,
reexporta em uma linha.

**Decisão 3 — verificação visual adiada.** Vários passos do plano pedem abrir o
site no navegador e conferir com os olhos. Subagente não enxerga navegador, então
esses passos foram substituídos pelo teste de caracterização mais `npm run build`,
e a conferência visual foi concentrada na verificação de ponta a ponta da Task 14.
Custo se errado: uma diferença puramente de renderização, que não altere nenhum
valor, passa despercebida até a Task 14.

**Decisão 4 — lacuna de teste no filtro do currículo, roteada para a Task 14.**
A revisão da Task 3 apontou, com razão, que o teste novo prende os *valores* de
`showInCv` no JSON, não a expressão do filtro em `Curriculo.jsx:121`. Se alguém
inverter aquela linha, a suíte passa e o currículo mostra os projetos errados.
Não despachei correção de código: o remédio sugerido (assertar
`projects.filter(p => p.showInCv)` no teste) reimplementa a expressão do
componente dentro do teste, então passaria igual com o componente invertido — não
fecha a lacuna. O remédio genuíno exigiria teste de renderização (`jsdom` +
testing-library, que estoura a restrição de "só vitest") ou extrair um seletor
compartilhado (over-engineering para um filtro de uma linha). Em vez disso,
emendei o Step 5.6 da Task 14 para exigir a conferência de ponta a ponta.
Custo se errado: até a Task 14, uma inversão daquela linha não é pega por teste.
O código atual foi conferido à mão e está correto.

**Decisão 5 — atribuição heterogênea no commit `e8e2341`.** Aquele commit saiu
com `Co-Authored-By: Claude Haiku 4.5` em vez da linha padrão da sessão, porque o
subagente substituiu pelo próprio modelo. Não reescrevi o histórico por um
metadado cosmético. Os commits seguintes trazem a linha correta.

**Decisão 6 (contingência, ainda não acionada).** `api/publish.js` vai importar
`../src/data/schema.js`, de fora da pasta `api/`. Se o empacotador da Vercel não
incluir esse arquivo — o que só se descobre na Task 14 — mova `schema.js` para
`api/_lib/schema.js` e faça o cliente importar de lá, em vez de duplicar o
validador.

**Decisão 7 — sem guarda especulativa no validador.** A revisão notou que
`validateContent` chama `JSON.stringify` sem proteção, então uma referência
circular ou um `BigInt` fariam a função lançar exceção em vez de recusar limpo.
Verifiquei que os dois únicos chamadores passam objetos derivados de JSON (o
`req.body` já parseado pela Vercel, e o rascunho do painel), e nenhum deles
consegue produzir ciclo ou `BigInt` — então não acrescentei guarda, que viraria
código inalcançável. **Ao implementar a Task 8, confirme isso no endpoint de
publicação.** Custo se errado: um chamador futuro que passe objeto vivo derruba a
função em vez de recusar limpo.

## Achados menores, deixados em aberto de propósito

- O ignore de `.claude` no ESLint é amplo; um glob mais estreito seria mais
  seguro. Contexto: `.claude/skills/onp-spec-driven/` traz ~19 arquivos `.js`
  vendorizados que o ESLint varria — **`npm run lint` já estava quebrado neste
  repositório antes deste trabalho começar**.
- `npm run admin:hash` só funciona a partir da Task 5, quando
  `scripts/hash-password.js` passa a exister.
- `.spec/` e `onpspec.config.json` estão sem rastreamento no repositório,
  aparentemente resíduo da mesma skill vendorizada. Não foram tocados: versionar
  ou ignorar é decisão sua.

## O que só você pode fazer (Task 14)

Nenhum agente faz isto no seu lugar, e nada disso foi feito ainda:

1. Criar um PAT fine-grained no GitHub, restrito ao repositório
   `OPaiva-1721/portifolio`, com permissão **Contents: read and write** e validade
   de um ano.
2. Gerar o hash da senha com `npm run admin:hash`, usando senha aleatória longa
   vinda de gerenciador de senhas.
3. Cadastrar na Vercel: `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `GITHUB_TOKEN`,
   `GITHUB_BRANCH`.

Enquanto isso não for feito, o painel não tem como autenticar nem publicar.

## Estado do repositório

Nada foi enviado para fora além do push desta branch: sem deploy, sem token, sem
variável de ambiente cadastrada. A `main` está intocada.

Para desenvolver o painel localmente a partir da Task 7, `npm run dev` não basta —
funções em `api/` só rodam com `npx vercel dev`.
