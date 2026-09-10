# Painel de administração

O conteúdo textual do site vive em `src/data/content.json`. O painel em `/#admin`
edita esse arquivo e publica as alterações como um commit no repositório; a Vercel
refaz o build e o site atualiza em cerca de um minuto.

## Variáveis de ambiente

Cadastradas na Vercel (Settings → Environment Variables) e, para desenvolvimento,
em `.env.local`:

| Nome | Valor |
|---|---|
| `ADMIN_PASSWORD_HASH` | Saída de `npm run admin:hash`. |
| `SESSION_SECRET` | 32 bytes aleatórios em base64. |
| `GITHUB_TOKEN` | PAT fine-grained, só este repositório, Contents read/write. |
| `GITHUB_REPO` | `OPaiva-1721/portifolio` (padrão, pode ser omitida). |
| `GITHUB_BRANCH` | `main` em produção; `admin-test` em desenvolvimento. |

## Trocar a senha

```bash
npm run admin:hash
```

Cole o hash em `ADMIN_PASSWORD_HASH` na Vercel e refaça o deploy. Para invalidar
todas as sessões abertas, troque também o `SESSION_SECRET`.

## Renovar o token

O PAT vence em um ano. Quando vencer, publicar passa a falhar com a mensagem de
token expirado. Gere um novo com as mesmas permissões e atualize `GITHUB_TOKEN`.

## Desenvolvimento local

Funções em `api/` não rodam com `npm run dev`. Use:

```bash
npx vercel dev
```

Aponte `GITHUB_BRANCH` para uma branch de teste para não publicar na `main`.

## Testes

```bash
npm test
```

Cobrem o validador do conteúdo, a sessão assinada, a verificação de senha, o
cliente do GitHub e o cálculo do diff.
