# Painel de administração com login — design

Data: 2026-09-09
Status: aprovado para planejamento

## Problema

Todo o conteúdo textual do portfólio vive em `src/data/content.js`. Qualquer
correção de bio, novo emprego ou projeto novo exige abrir o editor, mexer em
código JavaScript e fazer commit à mão. O objetivo é permitir que o autor edite
esse conteúdo por uma interface, sem tocar no código.

## Decisões

Definidas em conversa, todas fechadas:

| Questão | Decisão |
|---|---|
| Escopo do conteúdo | Todo o texto de `content.js`. Mídia fica de fora. |
| Destino da edição | Commit no próprio repositório; a Vercel rebuilda (~1 min). |
| Autenticação | Senha única, só o autor. |
| Interface | Painel próprio em `/#admin`, separado do site público. |
| Operações | CRUD completo: criar, editar, remover e reordenar. |
| Granularidade do commit | Alterações acumulam num rascunho; um botão publica tudo num commit. |
| Rate limiting | Sem Vercel KV. Senha longa de gerenciador é a defesa principal. |

## Fora de escopo

Deliberadamente não construído: upload de mídia, múltiplos usuários ou papéis,
edição inline no site público, editor de tema ou layout, criação de seções novas,
prévia em tempo real ao lado do formulário, rate limiting com estado
compartilhado.

## Arquitetura

### Modelo de dados

O conteúdo migra de objetos literais em JavaScript para `src/data/content.json`,
dado puro que um endpoint consegue reescrever com segurança. O `content.js`
permanece como casca fina que importa o JSON e reexporta as mesmas constantes,
de modo que nenhum componente do site precisa mudar.

Forma do documento:

```
{
  bio:            { tagline, text, stack: [string], softSkills: [string] }
  education:      [ { id, degree, institution, period, description } ]
  certifications: [ string ]
  commits:        [ { id, hash, tag: string|null, scope,
                      roles: [ { date, role, additions: [string],
                                 removals: [string], stack: [string] } ] } ]
  projects:       [ { id, filename, name, description, stack: [string],
                      href, showInCv: boolean } ]
  contact:        { name, email, github, whatsapp }
}
```

`showInCv` é campo novo (ver "Mudanças em código existente").

### Roteamento

`App.jsx` já alterna para o currículo quando o hash é `#cv`. Ganha o mesmo
tratamento para `#admin`, carregando o painel por `React.lazy`. O código do
painel vira um chunk separado, baixado apenas por quem abre `/#admin` —
visitantes do portfólio não pagam nada pela existência do recurso.

### Endpoints

Funções serverless em `api/` na raiz, detectadas automaticamente pela Vercel.
Nenhum `vercel.json` necessário.

| Endpoint | Sessão | Responsabilidade |
|---|---|---|
| `POST /api/login` | não | Verifica a senha, emite cookie de sessão. |
| `POST /api/logout` | não | Expira o cookie. Necessário no servidor, já que o cookie é `httpOnly` e o JavaScript da página não o alcança. |
| `GET /api/content` | sim | Lê `content.json` do GitHub, devolve conteúdo e `sha`. |
| `POST /api/publish` | sim | Valida o documento e escreve no repositório. |

`GET /api/content` lê do GitHub e não do bundle: se o arquivo for editado
direto no código, o painel abre já com a versão real e nunca sobrescreve
cegamente o que está lá.

### Dependências

Nenhuma dependência de runtime é adicionada. `scrypt` e HMAC-SHA256 vêm do
`node:crypto`; a chamada ao GitHub usa o `fetch` global do Node 18+. Vitest
entra apenas como dependência de desenvolvimento.

### Variáveis de ambiente

| Nome | Uso |
|---|---|
| `ADMIN_PASSWORD_HASH` | Hash scrypt com salt, gerado por script local. |
| `SESSION_SECRET` | Chave HMAC que assina o cookie de sessão. |
| `GITHUB_TOKEN` | PAT fine-grained, só este repositório, só Contents read/write. |
| `GITHUB_BRANCH` | Branch de destino. `main` em produção; branch de teste em dev. |

## Autenticação e segurança

A senha nunca existe em texto no projeto. Um script local (`npm run admin:hash`)
imprime um hash scrypt com salt aleatório para colar na Vercel. O `login`
recalcula e compara em tempo constante.

A sessão é um cookie assinado com HMAC-SHA256 contendo apenas a expiração, válido
por 8 horas, com `httpOnly`, `Secure` e `SameSite=Strict`. Não há sessão
armazenada em lugar nenhum; revogar tudo equivale a trocar o `SESSION_SECRET`.
`SameSite=Strict` em SPA de mesma origem cobre CSRF, e `publish` ainda exige
`Content-Type: application/json`, o que impede envio por formulário externo.

O token do GitHub nunca chega ao navegador. O painel fala com as funções, e só
elas falam com o GitHub.

### Modelo de ameaça

`/#admin` é rota de cliente: a tela de login é visível a qualquer um, e a
proteção é a senha, não o segredo do endereço. Isso é adequado porque todo o
conteúdo do site é público de qualquer forma — o pior caso de uma senha vazada é
desfiguração de texto. O token não alcança outros repositórios, Actions ou
configurações, e o estrago é reversível com `git revert` mais rotação de senha e
token.

Rate limiting real exigiria estado compartilhado (Vercel KV), rejeitado por
custo de manutenção desproporcional: contra uma senha aleatória de 20+ caracteres
com o custo de scrypt embutido, limitar tentativas não compra segurança
mensurável. Ficam a defesa barata — atraso fixo em toda falha e contador em
memória por instância — e a senha forte como defesa real. Gatilhos para revisar:
abrir acesso a outra pessoa, ou pico anômalo de invocações no painel da Vercel.

## Painel

### Navegação

Sem sessão, `/#admin` mostra apenas o prompt de senha, na linguagem de terminal
do site. Com sessão, o painel abre com navegação lateral espelhando as seções
que o site já nomeia: `~/bio`, `~/formacao`, `~/certificacoes`, `~/experiencia`,
`~/projetos`, `~/contato`.

### Rascunho

Ao abrir, o painel busca o conteúdo e guarda duas cópias: a base e a editável.
Toda alteração afeta só a segunda. O rascunho e o `sha` da base são persistidos
em `localStorage`, de modo que fechar a aba ou travar o navegador não custa
trabalho. A barra superior mostra quais seções estão modificadas, no formato de
um `git status`.

### Publicação

O botão "commit & publicar" abre o diff entre base e rascunho, linha a linha, na
mesma estética de adições e remoções que o site usa para narrar a carreira. Após
confirmação, `publish` valida e escreve, e a tela responde com o hash do commit,
link para ele no GitHub e o aviso de que o site atualiza em cerca de um minuto.
A base passa a ser o conteúdo publicado e o indicador de alterações zera.

A mensagem do commit é gerada pelo painel a partir das seções alteradas, no
formato `content: atualiza bio, projetos`, com as seções em ordem fixa. O autor
não a digita — foi decisão explícita manter a publicação em um clique.

### Conflito

`publish` envia o `sha` do arquivo carregado. Se o `content.json` tiver mudado no
intervalo, o GitHub recusa a escrita e o painel informa o conflito, oferecendo
recarregar do servidor — nunca sobrescreve alteração alheia em silêncio.

### Edição

Reordenação por botões subir/descer, não por arrastar: zero dependência,
acessível por teclado e funcional no celular. Três componentes reutilizáveis
sustentam todos os formulários — um editor de lista de strings (`stack`,
`additions`, `removals`, certificações, soft skills), um envelope de lista com
adicionar/remover/reordenar, e um campo rotulado. A experiência tem três níveis
(commit, cargos, itens) e usa cards recolhíveis para não virar um paredão.

Ao criar um emprego, o painel gera sozinho o hash decorativo de 7 caracteres.

A validação roda no cliente, para aviso imediato, e de novo no servidor, que
rejeita tipos incorretos, chaves desconhecidas, ids duplicados e payload acima de
256 KB — cerca de quarenta vezes o conteúdo atual, folgado para crescimento
legítimo e apertado o bastante para barrar abuso. O cliente nunca é fonte de
confiança.

Projetos criados pelo painel nascem com `showInCv: true`; esconder do currículo é
ação deliberada, não padrão silencioso.

## Mudanças em código existente

1. `src/data/content.js` passa a importar e reexportar `content.json`. Nenhum
   componente muda.
2. `src/App.jsx` ganha a rota `#admin` com carregamento lazy.
3. `src/components/Curriculo.jsx:121` filtra o projeto PRICE DROP por id literal
   (`p.id !== 'price-drop'`). Renomear ou remover esse projeto pelo painel
   quebraria o filtro em silêncio. A regra vira o campo `showInCv` em cada
   projeto, editável por caixa de seleção, e o componente passa a filtrar por
   ele. A decisão editorial existente é preservada, com `showInCv: false` apenas
   no PRICE DROP.

## Tratamento de erros

Princípio: nenhuma falha apaga o rascunho.

| Situação | Resposta |
|---|---|
| Sessão expirada ao publicar | Modal de senha; ao autenticar, republica automaticamente. |
| Senha incorreta | Resposta genérica e atrasada, sem distinguir causa. |
| Token do GitHub expirado ou sem permissão | Mensagem específica; rascunho preservado. |
| GitHub indisponível | Mensagem específica; ação pode ser repetida. |
| Conflito de `sha` | Explicação e opção de recarregar do servidor. |
| `content.json` corrompido no repositório | Indicação do campo inválido, em vez de painel vazio. |
| Exceção no painel | Limite de erro próprio, sem tela branca. |

Se um build falhar, a Vercel mantém a versão anterior no ar: o site público nunca
sai do ar por causa de uma edição.

## Testes

O projeto não tem testes hoje. Vitest entra como dependência de desenvolvimento,
cobrindo o que tem risco real, com os testes escritos antes do código:

- validador de schema: aceita o conteúdo atual; rejeita tipo incorreto, id
  duplicado, chave desconhecida e payload acima do limite;
- assinatura de sessão: cookie válido aceito, adulterado recusado, expirado
  recusado;
- verificação de senha: hash correto aceito, incorreto recusado;
- migração: o `content.json` corresponde exatamente aos objetos exportados hoje.
  Escrito antes de alterar o `content.js`.

Formulários e a chamada real ao GitHub ficam em verificação manual; automatizá-los
custaria mais do que protegem neste contexto.

## Operação

Passos manuais, uma vez:

1. Criar um PAT fine-grained no GitHub, restrito a `OPaiva-1721/portifolio`, com
   permissão Contents read/write e validade de um ano.
2. Gerar o hash da senha com `npm run admin:hash`, usando senha aleatória longa
   de gerenciador de senhas.
3. Cadastrar as quatro variáveis de ambiente na Vercel.

Desenvolvimento local passa a usar `vercel dev` em vez de `npm run dev`, já que
funções em `api/` não rodam sob o Vite puro. As variáveis ficam em `.env.local`,
já ignorado pelo `.gitignore`, e `GITHUB_BRANCH` aponta para uma branch de teste
para exercitar o ciclo completo sem tocar na `main`.

## Riscos

- O PAT vence em um ano e a falha aparecerá como erro de permissão ao publicar.
  A mensagem de erro nomeia essa causa explicitamente.
- Edição simultânea pelo painel e pelo código é detectada pelo `sha`, não
  resolvida automaticamente; a resolução é manual e consciente.
