# Painel de administração com login — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o autor edite todo o conteúdo textual do portfólio por um painel em `/#admin`, protegido por senha, publicando as alterações como commit no próprio repositório.

**Architecture:** O conteúdo migra de objetos JavaScript para `src/data/content.json`, e `content.js` vira uma casca que reexporta o JSON — nenhum componente do site muda. Quatro funções serverless em `api/` cuidam de login, logout, leitura e escrita, guardando o token do GitHub fora do navegador. O painel é React carregado sob demanda em `#admin`, mantém um rascunho local e publica tudo num commit só.

**Tech Stack:** React 18, Vite 5, funções serverless da Vercel (Node 22+, ESM), `node:crypto` para senha e sessão, GitHub Contents API, Vitest para testes.

**Spec:** `docs/superpowers/specs/2026-09-09-admin-login-cms-design.md`

## Global Constraints

- **Zero dependências de runtime novas.** Nada entra em `dependencies` do `package.json`. Apenas `vitest` entra em `devDependencies`.
- **Nenhum componente público muda de import.** `Sobre.jsx`, `Experiencia.jsx`, `Projetos.jsx`, `Contato.jsx`, `Commit.jsx`, `ProjectCard.jsx` seguem importando de `src/data/content.js` exatamente como hoje. A única exceção autorizada é `Curriculo.jsx` (Task 3).
- **Idioma:** todo texto de interface e toda mensagem de erro em pt-BR.
- **Identidade visual:** o painel usa os tokens já definidos em `src/index.css` — `--bg`, `--surface`, `--text`, `--amber`, `--mint`, `--lilac`, `--border`, `--font-mono`, `--font-body`, `--font-display`. Nenhuma cor nova em hexadecimal fora desses tokens.
- **Limite de payload:** `256 * 1024` bytes.
- **Duração da sessão:** 8 horas.
- **Caminho do arquivo no repositório:** `src/data/content.json`.
- **Chaves de seção, nesta ordem fixa:** `bio`, `education`, `certifications`, `commits`, `projects`, `contact`.
- **Variáveis de ambiente:** `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_BRANCH` (padrão `main`), `GITHUB_REPO` (padrão `OPaiva-1721/portifolio`).
- **O token do GitHub nunca é enviado ao navegador**, em nenhuma resposta, nem em mensagem de erro.
- **Commits frequentes:** cada task termina com um commit.

---

### Task 1: Ferramentas de teste e caracterização do conteúdo atual

Antes de mexer no conteúdo, congelamos o que ele é hoje num teste. Esse teste é de caracterização: ele **passa antes e depois** da migração, e é exatamente isso que prova que a migração não alterou nada.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Modify: `eslint.config.js`
- Test: `tests/migration.test.js`

**Interfaces:**
- Consumes: nada.
- Produces: comando `npm test` (executa `vitest run`); diretório `tests/` como local dos testes.

- [ ] **Step 1: Instalar o Vitest como dependência de desenvolvimento**

```bash
npm install --save-dev vitest@^2.1.8
```

- [ ] **Step 2: Criar a configuração do Vitest**

Arquivo separado de propósito: manter `vite.config.js` intocado evita que o build de produção passe a depender do Vitest.

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
```

- [ ] **Step 3: Adicionar os scripts ao `package.json`**

Na seção `"scripts"`, acrescente as três linhas abaixo (mantendo `dev`, `build`, `preview`, `lint` como estão):

```json
    "test": "vitest run",
    "test:watch": "vitest",
    "admin:hash": "node scripts/hash-password.js"
```

- [ ] **Step 4: Ensinar o ESLint sobre os arquivos Node**

`eslint.config.js` hoje aplica `globals.browser` a todo `**/*.{js,jsx}`. Os arquivos em `api/`, `scripts/` e `tests/` rodam no Node e usariam `process` e `Buffer`, que o lint acusaria como indefinidos. Acrescente este bloco ao final do array exportado, depois do bloco existente:

```js
  {
    files: ['api/**/*.js', 'scripts/**/*.js', 'tests/**/*.js', 'vitest.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: { sourceType: 'module' },
    },
  },
```

- [ ] **Step 5: Escrever o teste de caracterização**

```js
// tests/migration.test.js
import { describe, it, expect } from 'vitest';
import { bio, education, certifications, commits, projects, contact } from '../src/data/content.js';

describe('conteúdo do portfólio', () => {
  it('mantém a bio', () => {
    expect(bio.tagline).toBe(
      'Desenvolvedor de software com foco em automação — transformo processos manuais em fluxos que rodam sozinhos.',
    );
    expect(bio.text).toContain('Engenharia de Software no Biopark');
    expect(bio.stack).toHaveLength(9);
    expect(bio.stack[0]).toBe('TypeScript');
    expect(bio.stack).toContain('Drizzle ORM');
    expect(bio.softSkills).toEqual([
      'Raciocínio lógico',
      'Comunicação assertiva',
      'Proatividade',
      'Responsabilidade',
    ]);
  });

  it('mantém a formação', () => {
    expect(education).toHaveLength(1);
    expect(education[0].id).toBe('biopark');
    expect(education[0].degree).toBe('Engenharia de Software');
    expect(education[0].institution).toBe('Faculdade Biopark');
    expect(education[0].period).toBe('2023 — previsão 2027 · Toledo, Paraná');
    expect(education[0].description).toContain('Banco de Questões Donaduzzi');
  });

  it('mantém as certificações', () => {
    expect(certifications).toEqual([
      'Google Cloud Cybersecurity',
      'Google Cloud IA Generativa',
      'Inglês técnico',
      'Pacote Office',
    ]);
  });

  it('mantém a experiência', () => {
    expect(commits.map((c) => c.id)).toEqual(['inside-sistemas', 'c.vale', 'Iriedi']);
    expect(commits.map((c) => c.hash)).toEqual(['a1f3c9d', 'e7b2001', '4d8f61a']);
    expect(commits[0].tag).toBe('Atual');
    expect(commits[1].tag).toBeNull();
    expect(commits[0].scope).toBe('inside-sistemas');
    expect(commits[0].roles).toHaveLength(2);
    expect(commits[0].roles[0].role).toBe('Analista de Criação de Vídeo · Automação de Processos');
    expect(commits[0].roles[0].additions).toHaveLength(4);
    expect(commits[0].roles[0].stack).toContain('n8n');
    expect(commits[0].roles[0].removals).toEqual([]);
    expect(commits[2].roles[0].role).toBe('Assistente Administrativo (Jovem Aprendiz)');
  });

  it('mantém os projetos', () => {
    expect(projects.map((p) => p.id)).toEqual(['barberfoundation', 'orcamento-v2', 'price-drop']);
    expect(projects[0].name).toBe('BarberFoundation');
    expect(projects[0].filename).toBe('barber-foundation.dart');
    expect(projects[0].href).toBe('https://github.com/BarberFoundation');
    expect(projects[1].stack).toContain('Drizzle ORM');
    expect(projects[2].name).toBe('PRICE DROP');
  });

  it('mantém o contato', () => {
    expect(contact).toEqual({
      name: 'Gabryel Paiva Neves',
      email: 'gabryelpaiva123@gmail.com',
      github: 'OPaiva-1721',
      whatsapp: 'https://wa.me/554498727549',
    });
  });
});
```

- [ ] **Step 6: Rodar o teste contra o código atual**

Run: `npm test`
Expected: PASS, 6 testes. Se algum falhar, o valor esperado no teste está errado — **corrija o teste para refletir `src/data/content.js`, nunca o contrário**. Este é o retrato do estado atual.

- [ ] **Step 7: Rodar o lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.js eslint.config.js tests/migration.test.js
git commit -m "test: adiciona vitest e caracteriza o conteúdo atual"
```

---

### Task 2: Migrar o conteúdo para JSON

**Files:**
- Create: `src/data/content.json`
- Modify: `src/data/content.js` (substituição integral)
- Create e depois remover: `scripts/export-content.mjs`

**Interfaces:**
- Consumes: `tests/migration.test.js` da Task 1.
- Produces: `src/data/content.json` com as chaves `bio`, `education`, `certifications`, `commits`, `projects`, `contact`; `src/data/content.js` exportando as mesmas seis constantes nomeadas de antes.

- [ ] **Step 1: Escrever o script de exportação**

Transcrever o conteúdo à mão convidaria a erro de digitação silencioso. O script lê o módulo atual e serializa.

```js
// scripts/export-content.mjs
import { writeFileSync } from 'node:fs';
import * as content from '../src/data/content.js';

const data = {
  bio: content.bio,
  education: content.education,
  certifications: content.certifications,
  commits: content.commits,
  projects: content.projects,
  contact: content.contact,
};

writeFileSync('src/data/content.json', `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('src/data/content.json escrito');
```

- [ ] **Step 2: Rodar o script**

Run: `node scripts/export-content.mjs`
Expected: `src/data/content.json escrito`. Confira que o arquivo abre e tem as seis chaves de topo.

- [ ] **Step 3: Remover o script**

Ele existiu para uma migração única; mantê-lo confundiria quem ler o repositório depois.

```bash
rm scripts/export-content.mjs
```

- [ ] **Step 4: Substituir `src/data/content.js` pela casca**

Conteúdo integral do arquivo:

```js
// Centraliza todo o conteúdo editável do site.
// Os dados vivem em content.json para que o painel em /#admin consiga reescrevê-los.
// Este módulo existe para manter os imports dos componentes inalterados.
import data from './content.json';

export const bio = data.bio;
export const education = data.education;
export const certifications = data.certifications;
export const commits = data.commits;
export const projects = data.projects;
export const contact = data.contact;
```

- [ ] **Step 5: Rodar o teste de caracterização**

Run: `npm test`
Expected: PASS, os mesmos 6 testes. Qualquer falha aqui significa que a migração alterou o conteúdo — investigue antes de seguir.

- [ ] **Step 6: Verificar que o site ainda compila**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 7: Verificação visual**

Run: `npm run dev`, abra `http://localhost:5173`, percorra as seções Sobre, Experiência, Projetos e Contato, e depois `http://localhost:5173/#cv`.
Expected: idêntico ao de antes — mesmos textos, mesma ordem, mesmos três empregos e três projetos.

- [ ] **Step 8: Commit**

```bash
git add src/data/content.json src/data/content.js
git commit -m "refactor: move o conteúdo para content.json"
```

---

### Task 3: Substituir o filtro fixo do currículo pelo campo `showInCv`

Hoje `src/components/Curriculo.jsx:121` esconde o PRICE DROP comparando com o id literal `'price-drop'`. Renomear ou remover esse projeto pelo painel quebraria o filtro em silêncio.

**Files:**
- Modify: `src/data/content.json`
- Modify: `src/components/Curriculo.jsx` (a expressão `.filter(...)` por volta da linha 121)
- Test: `tests/migration.test.js`

**Interfaces:**
- Consumes: `src/data/content.json` da Task 2.
- Produces: campo `showInCv: boolean` em cada objeto de `projects`.

- [ ] **Step 1: Escrever o teste que falha**

Acrescente este bloco ao final de `tests/migration.test.js`, dentro do `describe` existente:

```js
  it('marca no dado quais projetos entram no currículo', () => {
    const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
    expect(byId['barberfoundation'].showInCv).toBe(true);
    expect(byId['orcamento-v2'].showInCv).toBe(true);
    expect(byId['price-drop'].showInCv).toBe(false);
  });
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — `expected undefined to be true`, porque o campo ainda não existe.

- [ ] **Step 3: Acrescentar o campo no JSON**

Em `src/data/content.json`, adicione `"showInCv"` como último campo de cada projeto: `true` em `barberfoundation` e `orcamento-v2`, `false` em `price-drop`.

- [ ] **Step 4: Rodar o teste**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Trocar o filtro no currículo**

Em `src/components/Curriculo.jsx`, substitua:

```jsx
                {projects
                  .filter((project) => project.id !== 'price-drop')
                  .map((project) => (
```

por:

```jsx
                {projects
                  .filter((project) => project.showInCv)
                  .map((project) => (
```

- [ ] **Step 6: Verificar o currículo**

Run: `npm run dev`, abra `http://localhost:5173/#cv`.
Expected: a seção Projetos mostra BarberFoundation e Orçamento.V2, sem o PRICE DROP — igual a antes.

- [ ] **Step 7: Commit**

```bash
git add src/data/content.json src/components/Curriculo.jsx tests/migration.test.js
git commit -m "feat: controla a presença no currículo por campo do conteúdo"
```

---

### Task 4: Validador do documento de conteúdo

Vive em `src/data/` porque é regra do dado, e é importado tanto pelo painel quanto pelas funções serverless — uma definição só, usada nos dois lados.

**Files:**
- Create: `src/data/schema.js`
- Test: `tests/schema.test.js`

**Interfaces:**
- Consumes: `src/data/content.json`.
- Produces:
  - `SECTION_KEYS: string[]` — `['bio','education','certifications','commits','projects','contact']`
  - `SECTION_LABELS: Record<string,string>` — rótulos em pt-BR
  - `MAX_CONTENT_BYTES: number` — `262144`
  - `validateContent(value): { ok: true } | { ok: false, errors: string[] }`
  - `emptyProject(): object`, `emptyCommit(): object`, `emptyRole(): object`, `emptyEducation(): object` — itens novos com campos vazios e válidos, usados pelo painel
  - `randomCommitHash(): string` — 7 caracteres hexadecimais

- [ ] **Step 1: Escrever os testes que falham**

```js
// tests/schema.test.js
import { describe, it, expect } from 'vitest';
import content from '../src/data/content.json';
import {
  validateContent,
  SECTION_KEYS,
  MAX_CONTENT_BYTES,
  emptyProject,
  emptyCommit,
  emptyRole,
  randomCommitHash,
} from '../src/data/schema.js';

function clone() {
  return structuredClone(content);
}

describe('validateContent', () => {
  it('aceita o conteúdo real do site', () => {
    expect(validateContent(content)).toEqual({ ok: true });
  });

  it('recusa o que não é objeto', () => {
    expect(validateContent(null).ok).toBe(false);
    expect(validateContent([]).ok).toBe(false);
    expect(validateContent('texto').ok).toBe(false);
  });

  it('recusa seção ausente', () => {
    const doc = clone();
    delete doc.projects;
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('projects');
  });

  it('recusa chave desconhecida no topo', () => {
    const doc = clone();
    doc.extra = 1;
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('extra');
  });

  it('recusa chave desconhecida dentro de um projeto', () => {
    const doc = clone();
    doc.projects[0].cor = 'azul';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa tipo errado', () => {
    const doc = clone();
    doc.bio.stack = 'TypeScript';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa texto obrigatório vazio', () => {
    const doc = clone();
    doc.projects[0].name = '   ';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa id duplicado', () => {
    const doc = clone();
    doc.projects[1].id = doc.projects[0].id;
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('duplicado');
  });

  it('recusa hash de commit fora do formato', () => {
    const doc = clone();
    doc.commits[0].hash = 'XYZ';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('aceita tag nula mas recusa tag numérica', () => {
    const doc = clone();
    doc.commits[0].tag = null;
    expect(validateContent(doc).ok).toBe(true);
    doc.commits[0].tag = 7;
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa showInCv que não é booleano', () => {
    const doc = clone();
    doc.projects[0].showInCv = 'sim';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa href que não é https', () => {
    const doc = clone();
    doc.projects[0].href = 'javascript:alert(1)';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa documento acima do limite de tamanho', () => {
    const doc = clone();
    doc.bio.text = 'x'.repeat(MAX_CONTENT_BYTES + 1);
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('tamanho');
  });

  it('recusa lista de strings com item vazio', () => {
    const doc = clone();
    doc.certifications = ['Google Cloud Cybersecurity', ''];
    expect(validateContent(doc).ok).toBe(false);
  });
});

describe('itens novos', () => {
  it('cria projeto válido dentro do documento', () => {
    const doc = clone();
    const novo = emptyProject();
    novo.id = 'novo-projeto';
    novo.name = 'Projeto novo';
    novo.filename = 'novo.ts';
    novo.description = 'Descrição';
    novo.href = 'https://github.com/OPaiva-1721/novo';
    doc.projects.push(novo);
    expect(validateContent(doc)).toEqual({ ok: true });
    expect(novo.showInCv).toBe(true);
  });

  it('cria commit com cargo e hash válidos', () => {
    const doc = clone();
    const novo = emptyCommit();
    novo.id = 'empresa-nova';
    novo.scope = 'empresa-nova';
    const cargo = emptyRole();
    cargo.date = 'Jan de 2027 — o momento';
    cargo.role = 'Desenvolvedor';
    novo.roles = [cargo];
    doc.commits.unshift(novo);
    expect(validateContent(doc)).toEqual({ ok: true });
  });
});

describe('randomCommitHash', () => {
  it('gera 7 caracteres hexadecimais minúsculos', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(randomCommitHash()).toMatch(/^[0-9a-f]{7}$/);
    }
  });
});

describe('SECTION_KEYS', () => {
  it('tem a ordem fixa das seções', () => {
    expect(SECTION_KEYS).toEqual([
      'bio',
      'education',
      'certifications',
      'commits',
      'projects',
      'contact',
    ]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — não existe `src/data/schema.js`.

- [ ] **Step 3: Implementar o validador**

```js
// src/data/schema.js
// Regras de forma do documento de conteúdo.
// Usado pelo painel (aviso imediato) e pelas funções serverless (fonte de verdade).

export const SECTION_KEYS = ['bio', 'education', 'certifications', 'commits', 'projects', 'contact'];

export const SECTION_LABELS = {
  bio: 'bio',
  education: 'formação',
  certifications: 'certificações',
  commits: 'experiência',
  projects: 'projetos',
  contact: 'contato',
};

export const MAX_CONTENT_BYTES = 256 * 1024;

const BIO_KEYS = ['tagline', 'text', 'stack', 'softSkills'];
const EDUCATION_KEYS = ['id', 'degree', 'institution', 'period', 'description'];
const COMMIT_KEYS = ['id', 'hash', 'tag', 'scope', 'roles'];
const ROLE_KEYS = ['date', 'role', 'additions', 'removals', 'stack'];
const PROJECT_KEYS = ['id', 'filename', 'name', 'description', 'stack', 'href', 'showInCv'];
const CONTACT_KEYS = ['name', 'email', 'github', 'whatsapp'];

const HASH_PATTERN = /^[0-9a-f]{7}$/;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

class Checker {
  constructor() {
    this.errors = [];
  }

  fail(path, message) {
    this.errors.push(`${path}: ${message}`);
    return false;
  }

  text(value, path, { allowEmpty = false } = {}) {
    if (typeof value !== 'string') return this.fail(path, 'deve ser texto');
    if (!allowEmpty && value.trim() === '') return this.fail(path, 'não pode ficar vazio');
    return true;
  }

  textList(value, path) {
    if (!Array.isArray(value)) return this.fail(path, 'deve ser uma lista');
    value.forEach((item, index) => this.text(item, `${path}[${index}]`));
    return true;
  }

  shape(value, path, allowedKeys) {
    if (!isPlainObject(value)) return this.fail(path, 'deve ser um objeto');
    Object.keys(value).forEach((key) => {
      if (!allowedKeys.includes(key)) this.fail(`${path}.${key}`, 'campo desconhecido');
    });
    allowedKeys.forEach((key) => {
      if (!(key in value)) this.fail(`${path}.${key}`, 'campo obrigatório ausente');
    });
    return true;
  }

  list(value, path) {
    if (!Array.isArray(value)) return this.fail(path, 'deve ser uma lista');
    return true;
  }

  uniqueIds(items, path) {
    const seen = new Set();
    items.forEach((item, index) => {
      if (!isPlainObject(item) || typeof item.id !== 'string') return;
      if (seen.has(item.id)) this.fail(`${path}[${index}].id`, `id duplicado: ${item.id}`);
      seen.add(item.id);
    });
  }
}

function checkBio(check, bio) {
  if (!check.shape(bio, 'bio', BIO_KEYS)) return;
  check.text(bio.tagline, 'bio.tagline');
  check.text(bio.text, 'bio.text');
  check.textList(bio.stack, 'bio.stack');
  check.textList(bio.softSkills, 'bio.softSkills');
}

function checkEducation(check, education) {
  if (!check.list(education, 'education')) return;
  education.forEach((item, index) => {
    const path = `education[${index}]`;
    if (!check.shape(item, path, EDUCATION_KEYS)) return;
    EDUCATION_KEYS.forEach((key) => check.text(item[key], `${path}.${key}`));
  });
  check.uniqueIds(education, 'education');
}

function checkCommits(check, commits) {
  if (!check.list(commits, 'commits')) return;
  commits.forEach((commit, index) => {
    const path = `commits[${index}]`;
    if (!check.shape(commit, path, COMMIT_KEYS)) return;
    check.text(commit.id, `${path}.id`);
    check.text(commit.scope, `${path}.scope`);
    if (typeof commit.hash !== 'string' || !HASH_PATTERN.test(commit.hash)) {
      check.fail(`${path}.hash`, 'deve ter 7 caracteres hexadecimais minúsculos');
    }
    if (commit.tag !== null) check.text(commit.tag, `${path}.tag`);
    if (!check.list(commit.roles, `${path}.roles`)) return;
    commit.roles.forEach((role, roleIndex) => {
      const rolePath = `${path}.roles[${roleIndex}]`;
      if (!check.shape(role, rolePath, ROLE_KEYS)) return;
      check.text(role.date, `${rolePath}.date`);
      check.text(role.role, `${rolePath}.role`);
      check.textList(role.additions, `${rolePath}.additions`);
      check.textList(role.removals, `${rolePath}.removals`);
      check.textList(role.stack, `${rolePath}.stack`);
    });
  });
  check.uniqueIds(commits, 'commits');
}

function checkProjects(check, projects) {
  if (!check.list(projects, 'projects')) return;
  projects.forEach((project, index) => {
    const path = `projects[${index}]`;
    if (!check.shape(project, path, PROJECT_KEYS)) return;
    check.text(project.id, `${path}.id`);
    check.text(project.filename, `${path}.filename`);
    check.text(project.name, `${path}.name`);
    check.text(project.description, `${path}.description`);
    check.textList(project.stack, `${path}.stack`);
    if (check.text(project.href, `${path}.href`) && !project.href.startsWith('https://')) {
      check.fail(`${path}.href`, 'deve começar com https://');
    }
    if (typeof project.showInCv !== 'boolean') {
      check.fail(`${path}.showInCv`, 'deve ser verdadeiro ou falso');
    }
  });
  check.uniqueIds(projects, 'projects');
}

function checkContact(check, contact) {
  if (!check.shape(contact, 'contact', CONTACT_KEYS)) return;
  CONTACT_KEYS.forEach((key) => check.text(contact[key], `contact.${key}`));
}

export function validateContent(value) {
  const check = new Checker();

  if (!isPlainObject(value)) {
    return { ok: false, errors: ['documento: deve ser um objeto'] };
  }

  const serialized = JSON.stringify(value);
  if (byteLength(serialized) > MAX_CONTENT_BYTES) {
    return { ok: false, errors: [`documento: tamanho acima do limite de ${MAX_CONTENT_BYTES} bytes`] };
  }

  Object.keys(value).forEach((key) => {
    if (!SECTION_KEYS.includes(key)) check.fail(key, 'seção desconhecida');
  });
  SECTION_KEYS.forEach((key) => {
    if (!(key in value)) check.fail(key, 'seção obrigatória ausente');
  });

  if ('bio' in value) checkBio(check, value.bio);
  if ('education' in value) checkEducation(check, value.education);
  if ('certifications' in value) check.textList(value.certifications, 'certifications');
  if ('commits' in value) checkCommits(check, value.commits);
  if ('projects' in value) checkProjects(check, value.projects);
  if ('contact' in value) checkContact(check, value.contact);

  return check.errors.length === 0 ? { ok: true } : { ok: false, errors: check.errors };
}

export function randomCommitHash() {
  const digits = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 7; i += 1) {
    hash += digits[Math.floor(Math.random() * digits.length)];
  }
  return hash;
}

export function emptyEducation() {
  return { id: '', degree: '', institution: '', period: '', description: '' };
}

export function emptyRole() {
  return { date: '', role: '', additions: [], removals: [], stack: [] };
}

export function emptyCommit() {
  return { id: '', hash: randomCommitHash(), tag: null, scope: '', roles: [emptyRole()] };
}

export function emptyProject() {
  return { id: '', filename: '', name: '', description: '', stack: [], href: '', showInCv: true };
}
```

- [ ] **Step 4: Rodar os testes**

Run: `npm test`
Expected: PASS, todos.

Nota: `emptyRole()` e `emptyCommit()` devolvem campos vazios, que o validador recusa até serem preenchidos. Isso é intencional — o painel avisa o autor antes de deixar publicar.

- [ ] **Step 5: Commit**

```bash
git add src/data/schema.js tests/schema.test.js
git commit -m "feat: valida a forma do documento de conteúdo"
```

---

### Task 5: Senha e sessão

**Files:**
- Create: `api/_lib/password.js`
- Create: `api/_lib/session.js`
- Create: `scripts/hash-password.js`
- Test: `tests/password.test.js`
- Test: `tests/session.test.js`

Pastas e arquivos iniciados por `_` dentro de `api/` não viram rotas na Vercel — é assim que a biblioteca compartilhada fica fora do alcance da rede.

**Interfaces:**
- Consumes: nada.
- Produces:
  - `hashPassword(password: string): Promise<string>`
  - `verifyPassword(password: string, stored: string): Promise<boolean>`
  - `COOKIE_NAME: 'portfolio_admin'`
  - `SESSION_TTL_SECONDS: 28800`
  - `createSessionToken(secret: string, now?: number): string`
  - `verifySessionToken(token: string, secret: string, now?: number): boolean`
  - `sessionCookie(token: string): string`
  - `clearedSessionCookie(): string`
  - `readCookie(header: string | undefined, name: string): string | null`

- [ ] **Step 1: Escrever os testes de senha**

```js
// tests/password.test.js
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../api/_lib/password.js';

describe('hash de senha', () => {
  it('aceita a senha correta', async () => {
    const stored = await hashPassword('senha-longa-de-teste-123');
    expect(await verifyPassword('senha-longa-de-teste-123', stored)).toBe(true);
  });

  it('recusa a senha errada', async () => {
    const stored = await hashPassword('senha-longa-de-teste-123');
    expect(await verifyPassword('senha-errada', stored)).toBe(false);
  });

  it('gera salt diferente a cada chamada', async () => {
    const a = await hashPassword('mesma-senha');
    const b = await hashPassword('mesma-senha');
    expect(a).not.toBe(b);
    expect(await verifyPassword('mesma-senha', a)).toBe(true);
    expect(await verifyPassword('mesma-senha', b)).toBe(true);
  });

  it('recusa hash malformado sem lançar erro', async () => {
    expect(await verifyPassword('x', '')).toBe(false);
    expect(await verifyPassword('x', 'lixo')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$1$2')).toBe(false);
    expect(await verifyPassword('x', undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Escrever os testes de sessão**

```js
// tests/session.test.js
import { describe, it, expect } from 'vitest';
import {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
  sessionCookie,
  clearedSessionCookie,
  readCookie,
} from '../api/_lib/session.js';

const SECRET = 'segredo-de-teste';

describe('token de sessão', () => {
  it('aceita um token recém-criado', () => {
    expect(verifySessionToken(createSessionToken(SECRET), SECRET)).toBe(true);
  });

  it('recusa token assinado com outro segredo', () => {
    expect(verifySessionToken(createSessionToken('outro'), SECRET)).toBe(false);
  });

  it('recusa token adulterado', () => {
    const token = createSessionToken(SECRET);
    const [payload, signature] = token.split('.');
    const outroPayload = Buffer.from(
      JSON.stringify({ exp: Date.now() + 999999999 }),
    ).toString('base64url');
    expect(verifySessionToken(`${outroPayload}.${signature}`, SECRET)).toBe(false);
    expect(verifySessionToken(`${payload}.aaaa`, SECRET)).toBe(false);
  });

  it('recusa token expirado', () => {
    const agora = Date.now();
    const token = createSessionToken(SECRET, agora - (SESSION_TTL_SECONDS + 1) * 1000);
    expect(verifySessionToken(token, SECRET, agora)).toBe(false);
  });

  it('recusa entradas degeneradas', () => {
    expect(verifySessionToken('', SECRET)).toBe(false);
    expect(verifySessionToken('sem-ponto', SECRET)).toBe(false);
    expect(verifySessionToken(null, SECRET)).toBe(false);
    expect(verifySessionToken('a.b.c', SECRET)).toBe(false);
  });
});

describe('cookie', () => {
  it('marca o cookie como httpOnly, seguro e estrito', () => {
    const header = sessionCookie('abc');
    expect(header).toContain(`${COOKIE_NAME}=abc`);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('Secure');
    expect(header).toContain('SameSite=Strict');
    expect(header).toContain(`Max-Age=${SESSION_TTL_SECONDS}`);
  });

  it('expira o cookie ao limpar', () => {
    expect(clearedSessionCookie()).toContain('Max-Age=0');
  });

  it('lê o cookie do cabeçalho', () => {
    expect(readCookie(`outro=1; ${COOKIE_NAME}=valor; mais=2`, COOKIE_NAME)).toBe('valor');
    expect(readCookie(`${COOKIE_NAME}=valor`, COOKIE_NAME)).toBe('valor');
    expect(readCookie('outro=1', COOKIE_NAME)).toBeNull();
    expect(readCookie(undefined, COOKIE_NAME)).toBeNull();
  });
});
```

- [ ] **Step 3: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — os módulos em `api/_lib/` não existem.

- [ ] **Step 4: Implementar o hash de senha**

```js
// api/_lib/password.js
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
  });
  return [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;

  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, cost, blockSize, parallelization, saltBase64, keyBase64] = parts;
  const params = { N: Number(cost), r: Number(blockSize), p: Number(parallelization) };
  if (!Number.isInteger(params.N) || !Number.isInteger(params.r) || !Number.isInteger(params.p)) {
    return false;
  }

  try {
    const expected = Buffer.from(keyBase64, 'base64');
    if (expected.length === 0) return false;
    const actual = await scrypt(password, Buffer.from(saltBase64, 'base64'), expected.length, params);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Implementar a sessão**

```js
// api/_lib/session.js
import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'portfolio_admin';
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken(secret, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ exp: now + SESSION_TTL_SECONDS * 1000 }),
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || typeof secret !== 'string' || secret === '') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload, secret), 'utf8');
  const given = Buffer.from(signature, 'utf8');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > now;
  } catch {
    return false;
  }
}

// Secure é seguro mesmo em desenvolvimento: navegadores tratam localhost como origem confiável.
function cookie(value, maxAge) {
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function sessionCookie(token) {
  return cookie(token, SESSION_TTL_SECONDS);
}

export function clearedSessionCookie() {
  return cookie('', 0);
}

export function readCookie(header, name) {
  if (typeof header !== 'string') return null;
  for (const piece of header.split(';')) {
    const index = piece.indexOf('=');
    if (index === -1) continue;
    if (piece.slice(0, index).trim() === name) return piece.slice(index + 1).trim();
  }
  return null;
}
```

- [ ] **Step 6: Escrever o script de geração do hash**

```js
// scripts/hash-password.js
// Gera o valor de ADMIN_PASSWORD_HASH. A senha é lida do terminal e nunca gravada em disco.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hashPassword } from '../api/_lib/password.js';

const rl = createInterface({ input: stdin, output: stdout });

const password = await rl.question('Senha (use uma senha aleatória longa, de gerenciador de senhas): ');
rl.close();

if (password.trim().length < 16) {
  console.error('\nSenha muito curta. Use pelo menos 16 caracteres aleatórios.');
  process.exit(1);
}

console.log('\nCadastre na Vercel como ADMIN_PASSWORD_HASH:\n');
console.log(await hashPassword(password));
```

- [ ] **Step 7: Rodar os testes**

Run: `npm test`
Expected: PASS, todos.

- [ ] **Step 8: Experimentar o script**

Run: `npm run admin:hash`, digite uma senha qualquer com 16+ caracteres.
Expected: imprime uma linha começando com `scrypt$16384$8$1$`.

- [ ] **Step 9: Rodar o lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 10: Commit**

```bash
git add api/_lib/password.js api/_lib/session.js scripts/hash-password.js tests/password.test.js tests/session.test.js
git commit -m "feat: adiciona verificação de senha e sessão assinada"
```

---

### Task 6: Cliente do GitHub

**Files:**
- Create: `api/_lib/github.js`
- Test: `tests/github.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `CONTENT_PATH: 'src/data/content.json'`
  - `class GitHubError extends Error` com propriedades `code` e `status`; `code` é um de `'not_configured' | 'unauthorized' | 'conflict' | 'invalid_json' | 'unavailable'`
  - `readContentFile(): Promise<{ content: object, sha: string }>`
  - `writeContentFile({ content, sha, message }): Promise<{ commitSha: string, commitUrl: string }>`

- [ ] **Step 1: Escrever os testes**

```js
// tests/github.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readContentFile, writeContentFile, GitHubError, CONTENT_PATH } from '../api/_lib/github.js';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

beforeEach(() => {
  process.env.GITHUB_TOKEN = 'token-de-teste';
  process.env.GITHUB_REPO = 'dono/repo';
  process.env.GITHUB_BRANCH = 'main';
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_REPO;
  delete process.env.GITHUB_BRANCH;
});

describe('readContentFile', () => {
  it('decodifica o conteúdo e devolve o sha', async () => {
    const documento = { bio: { tagline: 'olá' } };
    const encoded = Buffer.from(JSON.stringify(documento)).toString('base64');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { content: encoded, sha: 'sha123' }));
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await readContentFile();

    expect(resultado).toEqual({ content: documento, sha: 'sha123' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://api.github.com/repos/dono/repo/contents/${CONTENT_PATH}?ref=main`);
    expect(options.headers.Authorization).toBe('Bearer token-de-teste');
  });

  it('classifica 401 como unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Bad credentials' })));
    await expect(readContentFile()).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('classifica JSON inválido no repositório', async () => {
    const encoded = Buffer.from('{ isso não é json').toString('base64');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { content: encoded, sha: 'x' })));
    await expect(readContentFile()).rejects.toMatchObject({ code: 'invalid_json' });
  });

  it('classifica indisponibilidade', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede caiu')));
    await expect(readContentFile()).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('exige configuração', async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(readContentFile()).rejects.toMatchObject({ code: 'not_configured' });
  });
});

describe('writeContentFile', () => {
  it('envia o conteúdo codificado com sha, branch e mensagem', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { commit: { sha: 'commit123', html_url: 'https://github.com/x/y/commit/commit123' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await writeContentFile({
      content: { bio: 1 },
      sha: 'sha-anterior',
      message: 'content: atualiza bio',
    });

    expect(resultado).toEqual({
      commitSha: 'commit123',
      commitUrl: 'https://github.com/x/y/commit/commit123',
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('PUT');
    const corpo = JSON.parse(options.body);
    expect(corpo.sha).toBe('sha-anterior');
    expect(corpo.branch).toBe('main');
    expect(corpo.message).toBe('content: atualiza bio');
    expect(JSON.parse(Buffer.from(corpo.content, 'base64').toString('utf8'))).toEqual({ bio: 1 });
  });

  it('classifica 409 como conflito', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { message: 'is at ... but expected' })));
    await expect(
      writeContentFile({ content: {}, sha: 'velho', message: 'x' }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('classifica 422 como conflito', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(422, { message: 'sha inválido' })));
    await expect(
      writeContentFile({ content: {}, sha: 'velho', message: 'x' }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('classifica 403 como unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(403, { message: 'Resource not accessible' })));
    await expect(
      writeContentFile({ content: {}, sha: 'velho', message: 'x' }),
    ).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('nunca expõe o token na mensagem de erro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, { message: 'erro interno' })));
    const erro = await writeContentFile({ content: {}, sha: 'v', message: 'x' }).catch((e) => e);
    expect(erro).toBeInstanceOf(GitHubError);
    expect(JSON.stringify(erro.message)).not.toContain('token-de-teste');
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — `api/_lib/github.js` não existe.

- [ ] **Step 3: Implementar o cliente**

```js
// api/_lib/github.js
// Único ponto do sistema que fala com o GitHub. O token vive aqui e não sai daqui.

const API_BASE = 'https://api.github.com';
export const CONTENT_PATH = 'src/data/content.json';

export class GitHubError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'GitHubError';
    this.code = code;
    this.status = status;
  }
}

function config() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubError('not_configured', 'GITHUB_TOKEN não está configurado no servidor');
  }
  return {
    token,
    repo: process.env.GITHUB_REPO || 'OPaiva-1721/portifolio',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'portifolio-admin',
  };
}

function classify(status) {
  if (status === 401 || status === 403) {
    return new GitHubError(
      'unauthorized',
      'O token do GitHub expirou ou perdeu a permissão de escrita neste repositório',
      status,
    );
  }
  if (status === 409 || status === 422) {
    return new GitHubError(
      'conflict',
      'O conteúdo no repositório mudou desde que o painel carregou',
      status,
    );
  }
  if (status === 404) {
    return new GitHubError('not_configured', `Arquivo ${CONTENT_PATH} não encontrado no repositório`, status);
  }
  return new GitHubError('unavailable', 'O GitHub respondeu com erro. Tente de novo em instantes', status);
}

async function request(url, options, token) {
  let response;
  try {
    response = await fetch(url, { ...options, headers: headers(token) });
  } catch {
    throw new GitHubError('unavailable', 'Não foi possível falar com o GitHub');
  }
  if (!response.ok) throw classify(response.status);
  return response.json();
}

export async function readContentFile() {
  const { token, repo, branch } = config();
  const url = `${API_BASE}/repos/${repo}/contents/${CONTENT_PATH}?ref=${branch}`;
  const body = await request(url, { method: 'GET' }, token);

  let content;
  try {
    content = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'));
  } catch {
    throw new GitHubError('invalid_json', `${CONTENT_PATH} no repositório não é JSON válido`);
  }

  return { content, sha: body.sha };
}

export async function writeContentFile({ content, sha, message }) {
  const { token, repo, branch } = config();
  const url = `${API_BASE}/repos/${repo}/contents/${CONTENT_PATH}`;
  const encoded = Buffer.from(`${JSON.stringify(content, null, 2)}\n`, 'utf8').toString('base64');

  const body = await request(
    url,
    { method: 'PUT', body: JSON.stringify({ message, content: encoded, sha, branch }) },
    token,
  );

  return { commitSha: body.commit.sha, commitUrl: body.commit.html_url };
}
```

- [ ] **Step 4: Rodar os testes**

Run: `npm test`
Expected: PASS, todos.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/github.js tests/github.test.js
git commit -m "feat: adiciona cliente do GitHub para ler e escrever o conteúdo"
```

---

### Task 7: Endpoints de login e logout

**Files:**
- Create: `api/_lib/http.js`
- Create: `api/login.js`
- Create: `api/logout.js`
- Test: `tests/http.test.js`

**Interfaces:**
- Consumes: `api/_lib/session.js`, `api/_lib/password.js` da Task 5.
- Produces:
  - `sendJson(res, status, body): void`
  - `hasSession(req): boolean`
  - `requireSession(req, res): boolean` — responde 401 e devolve `false` quando não há sessão
  - `isJsonRequest(req): boolean`
  - `methodNotAllowed(res, allowed: string[]): void`
  - Rotas `POST /api/login` e `POST /api/logout`

Contrato de resposta de erro, usado por todos os endpoints: `{ error: string, message: string }`. O painel decide o comportamento pelo `error`; o `message` é o texto mostrado ao autor.

- [ ] **Step 1: Escrever os testes dos helpers**

```js
// tests/http.test.js
import { describe, it, expect, vi } from 'vitest';
import { sendJson, hasSession, requireSession, isJsonRequest } from '../api/_lib/http.js';
import { COOKIE_NAME, createSessionToken } from '../api/_lib/session.js';

function fakeRes() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('sendJson', () => {
  it('define status, corpo e cabeçalho sem cache', () => {
    const res = fakeRes();
    sendJson(res, 201, { ok: true });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['Cache-Control']).toContain('no-store');
  });
});

describe('sessão na requisição', () => {
  it('reconhece cookie válido', () => {
    process.env.SESSION_SECRET = 'segredo';
    const token = createSessionToken('segredo');
    expect(hasSession({ headers: { cookie: `${COOKIE_NAME}=${token}` } })).toBe(true);
  });

  it('recusa quando não há cookie', () => {
    process.env.SESSION_SECRET = 'segredo';
    expect(hasSession({ headers: {} })).toBe(false);
  });

  it('recusa quando o segredo não está configurado', () => {
    delete process.env.SESSION_SECRET;
    expect(hasSession({ headers: { cookie: `${COOKIE_NAME}=qualquer` } })).toBe(false);
  });

  it('requireSession responde 401 e devolve falso', () => {
    process.env.SESSION_SECRET = 'segredo';
    const res = fakeRes();
    expect(requireSession({ headers: {} }, res)).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('unauthenticated');
  });
});

describe('isJsonRequest', () => {
  it('exige content-type json', () => {
    expect(isJsonRequest({ headers: { 'content-type': 'application/json' } })).toBe(true);
    expect(isJsonRequest({ headers: { 'content-type': 'application/json; charset=utf-8' } })).toBe(true);
    expect(isJsonRequest({ headers: { 'content-type': 'text/plain' } })).toBe(false);
    expect(isJsonRequest({ headers: {} })).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — `api/_lib/http.js` não existe.

- [ ] **Step 3: Implementar os helpers**

```js
// api/_lib/http.js
import { COOKIE_NAME, readCookie, verifySessionToken } from './session.js';

export function sendJson(res, status, body) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(status).json(body);
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  sendJson(res, 405, { error: 'method_not_allowed', message: 'Método não permitido' });
}

export function isJsonRequest(req) {
  const type = req.headers['content-type'];
  return typeof type === 'string' && type.split(';')[0].trim() === 'application/json';
}

export function hasSession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const token = readCookie(req.headers.cookie, COOKIE_NAME);
  return token !== null && verifySessionToken(token, secret);
}

export function requireSession(req, res) {
  if (hasSession(req)) return true;
  sendJson(res, 401, { error: 'unauthenticated', message: 'Sessão expirada. Entre de novo.' });
  return false;
}

export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

- [ ] **Step 4: Implementar o login**

```js
// api/login.js
import { verifyPassword } from './_lib/password.js';
import { createSessionToken, sessionCookie } from './_lib/session.js';
import { delay, isJsonRequest, methodNotAllowed, sendJson } from './_lib/http.js';

const FAILURE_DELAY_MS = 600;

// Freio barato contra script ingênuo. Vale por instância quente, não entre instâncias —
// a defesa real é uma senha aleatória longa, conforme decidido na spec.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = { count: 0, resetAt: 0 };

function tooManyFailures(now) {
  if (now > failures.resetAt) {
    failures.count = 0;
    failures.resetAt = now + WINDOW_MS;
  }
  return failures.count >= MAX_FAILURES;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isJsonRequest(req)) {
    return sendJson(res, 415, { error: 'unsupported_media_type', message: 'Envie JSON' });
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;
  if (!storedHash || !secret) {
    console.error('login: ADMIN_PASSWORD_HASH ou SESSION_SECRET ausente no ambiente');
    await delay(FAILURE_DELAY_MS);
    return sendJson(res, 500, {
      error: 'server_misconfigured',
      message: 'O servidor não está configurado. Confira as variáveis de ambiente na Vercel.',
    });
  }

  const now = Date.now();
  if (tooManyFailures(now)) {
    await delay(FAILURE_DELAY_MS);
    return sendJson(res, 429, {
      error: 'too_many_attempts',
      message: 'Muitas tentativas. Espere alguns minutos.',
    });
  }

  const password = req.body?.password;
  const ok = typeof password === 'string' && (await verifyPassword(password, storedHash));

  if (!ok) {
    failures.count += 1;
    await delay(FAILURE_DELAY_MS);
    return sendJson(res, 401, { error: 'invalid_credentials', message: 'Senha incorreta.' });
  }

  failures.count = 0;
  res.setHeader('Set-Cookie', sessionCookie(createSessionToken(secret)));
  return sendJson(res, 200, { ok: true });
}
```

- [ ] **Step 5: Implementar o logout**

```js
// api/logout.js
import { clearedSessionCookie } from './_lib/session.js';
import { methodNotAllowed, sendJson } from './_lib/http.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  res.setHeader('Set-Cookie', clearedSessionCookie());
  return sendJson(res, 200, { ok: true });
}
```

- [ ] **Step 6: Rodar testes e lint**

Run: `npm test && npm run lint`
Expected: PASS, sem erros de lint.

- [ ] **Step 7: Commit**

```bash
git add api/_lib/http.js api/login.js api/logout.js tests/http.test.js
git commit -m "feat: adiciona endpoints de login e logout"
```

---

### Task 8: Endpoints de leitura e publicação

**Files:**
- Create: `api/content.js`
- Create: `api/publish.js`

**Interfaces:**
- Consumes: `api/_lib/github.js` (Task 6), `api/_lib/http.js` (Task 7), `src/data/schema.js` (Task 4).
- Produces:
  - `GET /api/content` → `200 { content: object, sha: string }`
  - `POST /api/publish` com corpo `{ content: object, sha: string, message: string }` → `200 { commitSha: string, commitUrl: string, sha: string }`

`api/publish.js` importa o validador de `../src/data/schema.js`. O arquivo é ESM puro sem nada de Node, então serve aos dois ambientes.

- [ ] **Step 1: Implementar a leitura**

```js
// api/content.js
import { readContentFile } from './_lib/github.js';
import { methodNotAllowed, requireSession, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSession(req, res)) return undefined;

  try {
    const { content, sha } = await readContentFile();
    return sendJson(res, 200, { content, sha });
  } catch (error) {
    console.error('content:', error.code, error.message);
    const status = error.code === 'unauthorized' ? 502 : 502;
    return sendJson(res, status, {
      error: error.code || 'unavailable',
      message: error.message || 'Não foi possível ler o conteúdo',
    });
  }
}
```

- [ ] **Step 2: Implementar a publicação**

```js
// api/publish.js
import { writeContentFile } from './_lib/github.js';
import { isJsonRequest, methodNotAllowed, requireSession, sendJson } from './_lib/http.js';
import { validateContent } from '../src/data/schema.js';

const MAX_MESSAGE_LENGTH = 200;

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isJsonRequest(req)) {
    return sendJson(res, 415, { error: 'unsupported_media_type', message: 'Envie JSON' });
  }
  if (!requireSession(req, res)) return undefined;

  const { content, sha, message } = req.body ?? {};

  if (typeof sha !== 'string' || sha === '') {
    return sendJson(res, 400, {
      error: 'invalid_request',
      message: 'Requisição sem a referência do arquivo. Recarregue o painel.',
    });
  }

  if (typeof message !== 'string' || message.trim() === '' || message.length > MAX_MESSAGE_LENGTH) {
    return sendJson(res, 400, {
      error: 'invalid_request',
      message: 'Mensagem de commit inválida.',
    });
  }

  const validation = validateContent(content);
  if (!validation.ok) {
    return sendJson(res, 422, {
      error: 'invalid_content',
      message: 'O conteúdo tem campos inválidos.',
      details: validation.errors.slice(0, 20),
    });
  }

  try {
    const { commitSha, commitUrl } = await writeContentFile({ content, sha, message });
    return sendJson(res, 200, { commitSha, commitUrl, sha: commitSha });
  } catch (error) {
    console.error('publish:', error.code, error.message);
    const status = error.code === 'conflict' ? 409 : 502;
    return sendJson(res, status, {
      error: error.code || 'unavailable',
      message: error.message || 'Não foi possível publicar',
    });
  }
}
```

Nota sobre o `sha` devolvido: a Contents API devolve, em `content.sha`, o novo hash do arquivo. Devolvemos `commitSha` no campo `sha` apenas como marcador; o painel **recarrega o conteúdo do servidor após publicar** (Task 13, Step 4) e obtém o `sha` correto ali. Isso evita depender de um campo que a API pode variar.

- [ ] **Step 3: Rodar testes e lint**

Run: `npm test && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 4: Commit**

```bash
git add api/content.js api/publish.js
git commit -m "feat: adiciona endpoints de leitura e publicação do conteúdo"
```

---

### Task 9: Diferença entre o publicado e o rascunho

**Files:**
- Create: `src/admin/diff.js`
- Test: `tests/diff.test.js`

**Interfaces:**
- Consumes: `SECTION_KEYS`, `SECTION_LABELS` de `src/data/schema.js`.
- Produces:
  - `changedSections(base: object, draft: object): string[]` — chaves em ordem fixa
  - `commitMessage(sections: string[]): string`
  - `diffLines(before: string, after: string): Array<{ type: 'context'|'added'|'removed', text: string }>`
  - `sectionDiff(base: object, draft: object, key: string): Array<row>`
  - `collapse(rows, padding?: number): Array<row | { type: 'gap', count: number }>`

- [ ] **Step 1: Escrever os testes**

```js
// tests/diff.test.js
import { describe, it, expect } from 'vitest';
import { changedSections, commitMessage, diffLines, collapse } from '../src/admin/diff.js';

const base = {
  bio: { tagline: 'antes' },
  education: [],
  certifications: ['a'],
  commits: [],
  projects: [],
  contact: { name: 'Gabryel' },
};

describe('changedSections', () => {
  it('não acusa mudança quando nada mudou', () => {
    expect(changedSections(base, structuredClone(base))).toEqual([]);
  });

  it('lista só as seções alteradas, em ordem fixa', () => {
    const draft = structuredClone(base);
    draft.contact.name = 'outro';
    draft.bio.tagline = 'depois';
    expect(changedSections(base, draft)).toEqual(['bio', 'contact']);
  });

  it('detecta alteração dentro de lista', () => {
    const draft = structuredClone(base);
    draft.certifications.push('b');
    expect(changedSections(base, draft)).toEqual(['certifications']);
  });
});

describe('commitMessage', () => {
  it('usa os rótulos em português', () => {
    expect(commitMessage(['bio', 'projects'])).toBe('content: atualiza bio, projetos');
  });

  it('descreve uma seção só', () => {
    expect(commitMessage(['commits'])).toBe('content: atualiza experiência');
  });

  it('tem texto de reserva quando não há seção', () => {
    expect(commitMessage([])).toBe('content: atualiza o conteúdo do site');
  });
});

describe('diffLines', () => {
  it('marca linha adicionada', () => {
    expect(diffLines('a\nb', 'a\nb\nc')).toEqual([
      { type: 'context', text: 'a' },
      { type: 'context', text: 'b' },
      { type: 'added', text: 'c' },
    ]);
  });

  it('marca linha removida', () => {
    expect(diffLines('a\nb\nc', 'a\nc')).toEqual([
      { type: 'context', text: 'a' },
      { type: 'removed', text: 'b' },
      { type: 'context', text: 'c' },
    ]);
  });

  it('marca substituição como remoção seguida de adição', () => {
    const rows = diffLines('a\nb', 'a\nz');
    expect(rows).toContainEqual({ type: 'removed', text: 'b' });
    expect(rows).toContainEqual({ type: 'added', text: 'z' });
  });

  it('devolve só contexto quando os textos são iguais', () => {
    expect(diffLines('x\ny', 'x\ny').every((row) => row.type === 'context')).toBe(true);
  });
});

describe('collapse', () => {
  it('resume trechos longos sem alteração', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ type: 'context', text: `l${i}` }));
    rows.push({ type: 'added', text: 'novo' });
    const resultado = collapse(rows, 2);
    expect(resultado[0]).toEqual({ type: 'gap', count: 18 });
    expect(resultado.at(-1)).toEqual({ type: 'added', text: 'novo' });
  });

  it('não resume quando é tudo curto', () => {
    const rows = [
      { type: 'context', text: 'a' },
      { type: 'added', text: 'b' },
    ];
    expect(collapse(rows, 3)).toEqual(rows);
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — `src/admin/diff.js` não existe.

- [ ] **Step 3: Implementar**

```js
// src/admin/diff.js
import { SECTION_KEYS, SECTION_LABELS } from '../data/schema.js';

export function changedSections(base, draft) {
  return SECTION_KEYS.filter((key) => JSON.stringify(base?.[key]) !== JSON.stringify(draft?.[key]));
}

export function commitMessage(sections) {
  if (sections.length === 0) return 'content: atualiza o conteúdo do site';
  return `content: atualiza ${sections.map((key) => SECTION_LABELS[key]).join(', ')}`;
}

// Diff por linha via maior subsequência comum. As seções têm algumas centenas de
// linhas, então a tabela quadrática é barata e o resultado é mais legível que
// qualquer heurística.
export function diffLines(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const lengths = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const rows = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ type: 'context', text: a[i] });
      i += 1;
      j += 1;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      rows.push({ type: 'removed', text: a[i] });
      i += 1;
    } else {
      rows.push({ type: 'added', text: b[j] });
      j += 1;
    }
  }
  while (i < a.length) {
    rows.push({ type: 'removed', text: a[i] });
    i += 1;
  }
  while (j < b.length) {
    rows.push({ type: 'added', text: b[j] });
    j += 1;
  }
  return rows;
}

export function sectionDiff(base, draft, key) {
  return diffLines(
    JSON.stringify(base?.[key] ?? null, null, 2),
    JSON.stringify(draft?.[key] ?? null, null, 2),
  );
}

export function collapse(rows, padding = 3) {
  const keep = new Array(rows.length).fill(false);
  rows.forEach((row, index) => {
    if (row.type === 'context') return;
    for (let i = Math.max(0, index - padding); i <= Math.min(rows.length - 1, index + padding); i += 1) {
      keep[i] = true;
    }
  });

  const result = [];
  let skipped = 0;
  rows.forEach((row, index) => {
    if (keep[index]) {
      if (skipped > 0) {
        result.push({ type: 'gap', count: skipped });
        skipped = 0;
      }
      result.push(row);
    } else {
      skipped += 1;
    }
  });
  if (skipped > 0) result.push({ type: 'gap', count: skipped });
  return result;
}
```

- [ ] **Step 4: Rodar os testes**

Run: `npm test`
Expected: PASS, todos.

- [ ] **Step 5: Commit**

```bash
git add src/admin/diff.js tests/diff.test.js
git commit -m "feat: calcula a diferença entre o publicado e o rascunho"
```

---

### Task 10: Rota `#admin`, cliente HTTP e tela de login

Ao final desta task, `/#admin` já pede senha e mostra uma tela vazia autenticada. As seções entram nas tasks seguintes.

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/ErrorBoundary.jsx` (fallback opcional)
- Create: `src/admin/api.js`
- Create: `src/admin/AdminApp.jsx`
- Create: `src/admin/LoginScreen.jsx`
- Create: `src/admin/admin.css`

**Interfaces:**
- Consumes: endpoints das Tasks 7 e 8.
- Produces:
  - `api.js`: `login(password)`, `logout()`, `fetchContent()`, `publish({ content, sha, message })`, `class ApiError extends Error` com `code`, `status`, `details`
  - `AdminApp` como `export default` — o componente que `App.jsx` carrega em `#admin`

- [ ] **Step 1: Escrever o cliente HTTP**

```jsx
// src/admin/api.js
export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function call(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { credentials: 'same-origin', ...options });
  } catch {
    throw new ApiError({
      code: 'network',
      status: 0,
      message: 'Sem conexão com o servidor. Seu rascunho continua salvo.',
    });
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError({
      code: body?.error ?? 'unknown',
      status: response.status,
      message: body?.message ?? 'Algo falhou no servidor.',
      details: body?.details,
    });
  }

  return body;
}

function jsonPost(path, payload) {
  return call(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function login(password) {
  return jsonPost('/api/login', { password });
}

export function logout() {
  return jsonPost('/api/logout', {});
}

export function fetchContent() {
  return call('/api/content');
}

export function publish({ content, sha, message }) {
  return jsonPost('/api/publish', { content, sha, message });
}
```

- [ ] **Step 2: Escrever a tela de login**

```jsx
// src/admin/LoginScreen.jsx
import { useState } from 'react';

export default function LoginScreen({ onSubmit, error, busy }) {
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (password !== '') onSubmit(password);
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="admin-login-prompt mono">
          <span className="admin-login-dollar">$</span> sudo edit portfolio
        </p>
        <label className="admin-login-label" htmlFor="admin-password">
          senha
        </label>
        <input
          id="admin-password"
          className="admin-input mono"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
        {error ? (
          <p className="admin-login-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="admin-button-primary" type="submit" disabled={busy || password === ''}>
          {busy ? 'entrando…' : 'entrar'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Escrever o shell do painel**

`sections` fica como um marcador nesta task e recebe o conteúdo real na Task 11.

```jsx
// src/admin/AdminApp.jsx
import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchContent, login, logout } from './api.js';
import LoginScreen from './LoginScreen.jsx';
import './admin.css';

export default function AdminApp() {
  const [status, setStatus] = useState('checking');
  const [loginError, setLoginError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [server, setServer] = useState(null);

  const load = useCallback(async () => {
    try {
      const { content, sha } = await fetchContent();
      setServer({ content, sha });
      setLoadError(null);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'unauthenticated') {
        setStatus('anonymous');
        return;
      }
      setLoadError(error.message);
      setStatus('authenticated');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogin(password) {
    setBusy(true);
    setLoginError(null);
    try {
      await login(password);
      setStatus('checking');
      await load();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    setServer(null);
    setStatus('anonymous');
  }

  if (status === 'checking') {
    return <div className="admin-loading mono">carregando…</div>;
  }

  if (status === 'anonymous') {
    return <LoginScreen onSubmit={handleLogin} error={loginError} busy={busy} />;
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <span className="mono admin-brand">~/admin</span>
        <button className="admin-button" type="button" onClick={handleLogout}>
          sair
        </button>
      </header>
      <main className="admin-main">
        {loadError ? (
          <div className="admin-error" role="alert">
            <p>{loadError}</p>
            <button className="admin-button" type="button" onClick={load}>
              tentar de novo
            </button>
          </div>
        ) : (
          <p className="mono dim">
            conteúdo carregado: {Object.keys(server?.content ?? {}).length} seções
          </p>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Dar um fallback opcional ao `ErrorBoundary`**

O `ErrorBoundary` existente mostra um texto escrito para visitantes ("me chama direto"), inadequado para o painel, cujo único leitor é o autor. Em vez de duplicar o componente, torne o fallback configurável — sem prop, o comportamento atual permanece idêntico.

Em `src/components/ErrorBoundary.jsx`, dentro de `render()`, troque:

```jsx
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
```

por:

```jsx
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="error-fallback">
```

O restante do arquivo fica intacto.

- [ ] **Step 5: Ligar a rota em `App.jsx`**

Três mudanças no arquivo, nesta ordem. Primeiro, a linha de import do React e a declaração do componente lazy, logo abaixo dos imports existentes:

```jsx
import { lazy, Suspense, useEffect, useState } from 'react';
// os demais imports do arquivo permanecem exatamente como estão

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function routeFromHash() {
  const { hash } = window.location;
  if (hash === '#cv') return 'cv';
  if (hash === '#admin') return 'admin';
  return 'site';
}
```

Segundo, troque o estado booleano `isCv` por uma rota, já que agora há três destinos:

```jsx
  const [route, setRoute] = useState(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
```

Terceiro, troque `if (isCv) { return <Curriculo />; }` pelos dois desvios abaixo. O `return (<> ... </>)` final, com `BackgroundVideo`, `bg-blobs`, `Nav`, `main` e `Footer`, **não é alterado em nada**:

```jsx
  if (route === 'cv') {
    return <Curriculo />;
  }

  if (route === 'admin') {
    return (
      <ErrorBoundary
        fallback={
          <div className="admin-loading mono">
            $ status: o painel quebrou ao renderizar. Recarregue a página — seu rascunho está salvo.
          </div>
        }
      >
        <Suspense fallback={<div className="admin-loading mono">carregando painel…</div>}>
          <AdminApp />
        </Suspense>
      </ErrorBoundary>
    );
  }
```

`ErrorBoundary` já está importado no arquivo; nenhum import novo é necessário para ele.

- [ ] **Step 6: Escrever o CSS base do painel**

```css
/* src/admin/admin.css */
.admin,
.admin-login {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
}

.admin-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  opacity: 0.6;
}

/* ---------- LOGIN ---------- */
.admin-login {
  display: grid;
  place-items: center;
  padding: 24px;
}

.admin-login-card {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.admin-login-prompt {
  margin: 0 0 8px;
  font-size: 1.05rem;
}

.admin-login-dollar {
  color: var(--mint);
  margin-right: 8px;
}

.admin-login-label {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  opacity: 0.7;
}

.admin-login-error {
  margin: 0;
  color: var(--amber);
  font-size: 0.9rem;
}

/* ---------- CONTROLES ---------- */
.admin-input,
.admin-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.admin-input:focus-visible,
.admin-textarea:focus-visible {
  outline: 2px solid var(--amber);
  outline-offset: 1px;
}

.admin-textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

.admin-button,
.admin-button-primary {
  padding: 9px 16px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
}

.admin-button:hover:not(:disabled) {
  border-color: var(--mint);
  color: var(--mint);
}

.admin-button-primary {
  background: var(--mint);
  border-color: var(--mint);
  color: var(--bg);
  font-weight: 600;
}

.admin-button:disabled,
.admin-button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- ESTRUTURA ---------- */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.admin-brand {
  color: var(--lilac);
}

.admin-main {
  padding: 24px 20px 80px;
  max-width: 900px;
  margin: 0 auto;
}

.admin-error {
  padding: 16px;
  border: 1px solid var(--amber);
  border-radius: 8px;
  color: var(--amber);
}
```

- [ ] **Step 7: Verificar o roteamento sem backend**

Run: `npm run dev`, abra `http://localhost:5173/#admin`.
Expected: a chamada a `/api/content` falha (o Vite não serve funções), o painel mostra a mensagem de erro de rede e o botão "tentar de novo". O site em `/` e o currículo em `/#cv` continuam normais. Confirme também que navegar por `#sobre`, `#projetos` etc. não quebra nada.

- [ ] **Step 8: Verificar o corte do bundle**

Run: `npm run build`
Expected: a saída lista um chunk separado para `AdminApp`, além do chunk principal. Se o painel aparecer dentro do bundle principal, o `lazy` não está sendo aplicado.

- [ ] **Step 9: Rodar testes e lint**

Run: `npm test && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx src/components/ErrorBoundary.jsx src/admin/api.js src/admin/AdminApp.jsx src/admin/LoginScreen.jsx src/admin/admin.css
git commit -m "feat: adiciona rota /#admin com tela de login"
```

---

### Task 11: Campos reutilizáveis e seções simples

**Files:**
- Create: `src/admin/fields/Field.jsx`
- Create: `src/admin/fields/StringListEditor.jsx`
- Create: `src/admin/fields/ListEditor.jsx`
- Create: `src/admin/useDraft.js`
- Create: `src/admin/sections/BioSection.jsx`
- Create: `src/admin/sections/EducationSection.jsx`
- Create: `src/admin/sections/CertificationsSection.jsx`
- Create: `src/admin/sections/ContactSection.jsx`
- Modify: `src/admin/AdminApp.jsx`
- Modify: `src/admin/admin.css`

**Interfaces:**
- Consumes: `emptyEducation` de `src/data/schema.js`; `changedSections` de `src/admin/diff.js`.
- Produces:
  - `Field({ label, value, onChange, multiline, hint, type })`
  - `StringListEditor({ label, items, onChange, placeholder })`
  - `ListEditor({ items, onChange, createItem, title, addLabel, children })` — `children` é função `(item, update, index) => JSX`
  - `useDraft(server)` → `{ draft, setSection, changed, discard, clearStored }`
  - Cada seção: `({ value, onChange })`

- [ ] **Step 1: Campo rotulado**

```jsx
// src/admin/fields/Field.jsx
import { useId } from 'react';

export default function Field({ label, value, onChange, multiline = false, hint, type = 'text' }) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <div className="admin-field">
      <label className="admin-field-label" htmlFor={id}>
        {label}
      </label>
      <Tag
        id={id}
        className={multiline ? 'admin-textarea' : 'admin-input'}
        type={multiline ? undefined : type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="admin-field-hint">{hint}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Editor de lista de textos**

```jsx
// src/admin/fields/StringListEditor.jsx
function move(items, from, to) {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function StringListEditor({ label, items, onChange, placeholder = '' }) {
  const list = items ?? [];

  return (
    <div className="admin-field">
      <span className="admin-field-label">{label}</span>
      <ul className="admin-string-list">
        {list.map((item, index) => (
          // A posição é a identidade aqui: os itens são textos livres, sem id próprio.
          <li className="admin-string-item" key={index}>
            <input
              className="admin-input"
              value={item}
              placeholder={placeholder}
              aria-label={`${label}, item ${index + 1}`}
              onChange={(event) => {
                const copy = [...list];
                copy[index] = event.target.value;
                onChange(copy);
              }}
            />
            <div className="admin-row-actions">
              <button
                className="admin-icon-button"
                type="button"
                title="subir"
                aria-label={`Subir item ${index + 1}`}
                disabled={index === 0}
                onClick={() => onChange(move(list, index, index - 1))}
              >
                ↑
              </button>
              <button
                className="admin-icon-button"
                type="button"
                title="descer"
                aria-label={`Descer item ${index + 1}`}
                disabled={index === list.length - 1}
                onClick={() => onChange(move(list, index, index + 1))}
              >
                ↓
              </button>
              <button
                className="admin-icon-button admin-icon-danger"
                type="button"
                title="remover"
                aria-label={`Remover item ${index + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== index))}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button className="admin-button" type="button" onClick={() => onChange([...list, ''])}>
        + adicionar
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Envelope de lista de objetos**

```jsx
// src/admin/fields/ListEditor.jsx
import { useState } from 'react';

function move(items, from, to) {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function ListEditor({ items, onChange, createItem, title, addLabel, children }) {
  const list = items ?? [];
  const [collapsed, setCollapsed] = useState(() => new Set());

  function toggle(index) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function update(index, item) {
    const copy = [...list];
    copy[index] = item;
    onChange(copy);
  }

  function remove(index) {
    const rotulo = title(list[index], index);
    if (!window.confirm(`Remover "${rotulo}"? A alteração só vale quando você publicar.`)) return;
    onChange(list.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-list">
      {list.map((item, index) => {
        const isCollapsed = collapsed.has(index);
        return (
          // A posição é a identidade: estes itens não têm id próprio.
          <section className="admin-card" key={index}>
            <header className="admin-card-header">
              <button
                className="admin-card-toggle mono"
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() => toggle(index)}
              >
                <span className="admin-card-chevron">{isCollapsed ? '▸' : '▾'}</span>
                {title(item, index)}
              </button>
              <div className="admin-row-actions">
                <button
                  className="admin-icon-button"
                  type="button"
                  title="subir"
                  disabled={index === 0}
                  onClick={() => onChange(move(list, index, index - 1))}
                >
                  ↑
                </button>
                <button
                  className="admin-icon-button"
                  type="button"
                  title="descer"
                  disabled={index === list.length - 1}
                  onClick={() => onChange(move(list, index, index + 1))}
                >
                  ↓
                </button>
                <button
                  className="admin-icon-button admin-icon-danger"
                  type="button"
                  title="remover"
                  onClick={() => remove(index)}
                >
                  ✕
                </button>
              </div>
            </header>
            {isCollapsed ? null : (
              <div className="admin-card-body">
                {children(item, (next) => update(index, next), index)}
              </div>
            )}
          </section>
        );
      })}
      <button className="admin-button" type="button" onClick={() => onChange([...list, createItem()])}>
        {addLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Hook do rascunho**

```jsx
// src/admin/useDraft.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { changedSections } from './diff.js';

const STORAGE_KEY = 'portfolio-admin-draft';

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Modo privado ou armazenamento cheio: o rascunho segue em memória.
  }
}

function clearStored() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada a fazer.
  }
}

// O rascunho guardado só é reaproveitado se corresponder ao mesmo sha que o
// servidor acabou de devolver. Se o conteúdo mudou no repositório, o rascunho
// antigo é descartado para não reescrever alterações que não estão à vista.
export default function useDraft(server) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!server) {
      setDraft(null);
      return;
    }
    const stored = readStored();
    if (stored && stored.sha === server.sha) {
      setDraft(stored.content);
    } else {
      clearStored();
      setDraft(structuredClone(server.content));
    }
  }, [server]);

  useEffect(() => {
    if (server && draft) writeStored({ sha: server.sha, content: draft });
  }, [server, draft]);

  const setSection = useCallback((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const changed = useMemo(
    () => (server && draft ? changedSections(server.content, draft) : []),
    [server, draft],
  );

  const discard = useCallback(() => {
    if (!server) return;
    clearStored();
    setDraft(structuredClone(server.content));
  }, [server]);

  return { draft, setSection, changed, discard, clearStored };
}
```

- [ ] **Step 5: Seção de bio**

```jsx
// src/admin/sections/BioSection.jsx
import Field from '../fields/Field.jsx';
import StringListEditor from '../fields/StringListEditor.jsx';

export default function BioSection({ value, onChange }) {
  function set(key, next) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="admin-section">
      <Field
        label="Tagline"
        value={value.tagline}
        onChange={(next) => set('tagline', next)}
        hint="A frase que abre a seção Sobre."
      />
      <Field label="Texto" value={value.text} multiline onChange={(next) => set('text', next)} />
      <StringListEditor
        label="Stack"
        items={value.stack}
        onChange={(next) => set('stack', next)}
        placeholder="ex.: TypeScript"
      />
      <StringListEditor
        label="Soft skills"
        items={value.softSkills}
        onChange={(next) => set('softSkills', next)}
      />
    </div>
  );
}
```

- [ ] **Step 6: Seção de formação**

```jsx
// src/admin/sections/EducationSection.jsx
import { emptyEducation } from '../../data/schema.js';
import Field from '../fields/Field.jsx';
import ListEditor from '../fields/ListEditor.jsx';

export default function EducationSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <ListEditor
        items={value}
        onChange={onChange}
        createItem={emptyEducation}
        addLabel="+ adicionar formação"
        title={(item, index) => item.degree || `formação ${index + 1}`}
      >
        {(item, update) => (
          <>
            <Field
              label="Identificador"
              value={item.id}
              onChange={(next) => update({ ...item, id: next })}
              hint="Só letras, números e hífens. Não aparece no site."
            />
            <Field label="Curso" value={item.degree} onChange={(next) => update({ ...item, degree: next })} />
            <Field
              label="Instituição"
              value={item.institution}
              onChange={(next) => update({ ...item, institution: next })}
            />
            <Field
              label="Período"
              value={item.period}
              onChange={(next) => update({ ...item, period: next })}
              hint="ex.: 2023 — previsão 2027 · Toledo, Paraná"
            />
            <Field
              label="Descrição"
              value={item.description}
              multiline
              onChange={(next) => update({ ...item, description: next })}
            />
          </>
        )}
      </ListEditor>
    </div>
  );
}
```

- [ ] **Step 7: Seções de certificações e contato**

```jsx
// src/admin/sections/CertificationsSection.jsx
import StringListEditor from '../fields/StringListEditor.jsx';

export default function CertificationsSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <StringListEditor label="Certificações" items={value} onChange={onChange} />
    </div>
  );
}
```

```jsx
// src/admin/sections/ContactSection.jsx
import Field from '../fields/Field.jsx';

export default function ContactSection({ value, onChange }) {
  function set(key, next) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="admin-section">
      <Field label="Nome" value={value.name} onChange={(next) => set('name', next)} />
      <Field label="E-mail" value={value.email} type="email" onChange={(next) => set('email', next)} />
      <Field
        label="GitHub"
        value={value.github}
        onChange={(next) => set('github', next)}
        hint="Só o usuário, sem a URL. ex.: OPaiva-1721"
      />
      <Field
        label="WhatsApp"
        value={value.whatsapp}
        onChange={(next) => set('whatsapp', next)}
        hint="Link completo. ex.: https://wa.me/554498727549"
      />
    </div>
  );
}
```

- [ ] **Step 8: Ligar as seções no painel**

Em `src/admin/AdminApp.jsx`, importe `useDraft` e as quatro seções, e substitua o `<main>` de marcador por navegação lateral e conteúdo. As seções `commits` e `projects` entram na Task 12 — até lá, mostram um aviso.

```jsx
// acrescente aos imports
import useDraft from './useDraft.js';
import BioSection from './sections/BioSection.jsx';
import EducationSection from './sections/EducationSection.jsx';
import CertificationsSection from './sections/CertificationsSection.jsx';
import ContactSection from './sections/ContactSection.jsx';
import { SECTION_KEYS, SECTION_LABELS } from '../data/schema.js';
```

```jsx
// dentro do componente, depois dos estados existentes
const { draft, setSection, changed, discard } = useDraft(server);
const [active, setActive] = useState('bio');
```

```jsx
// substitua o conteúdo de <main className="admin-main"> por:
      <div className="admin-body">
        <nav className="admin-nav" aria-label="Seções do conteúdo">
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`admin-nav-item mono ${active === key ? 'is-active' : ''}`}
              aria-current={active === key ? 'true' : undefined}
              onClick={() => setActive(key)}
            >
              ~/{SECTION_LABELS[key]}
              {changed.includes(key) ? <span className="admin-nav-dot" title="modificado" /> : null}
            </button>
          ))}
        </nav>
        <main className="admin-main">
          {loadError ? (
            <div className="admin-error" role="alert">
              <p>{loadError}</p>
              <button className="admin-button" type="button" onClick={load}>
                tentar de novo
              </button>
            </div>
          ) : null}
          {draft === null ? <p className="mono dim">carregando conteúdo…</p> : renderSection()}
        </main>
      </div>
```

```jsx
// e defina, dentro do componente, antes do return:
  function renderSection() {
    if (active === 'bio') {
      return <BioSection value={draft.bio} onChange={(next) => setSection('bio', next)} />;
    }
    if (active === 'education') {
      return <EducationSection value={draft.education} onChange={(next) => setSection('education', next)} />;
    }
    if (active === 'certifications') {
      return (
        <CertificationsSection
          value={draft.certifications}
          onChange={(next) => setSection('certifications', next)}
        />
      );
    }
    if (active === 'contact') {
      return <ContactSection value={draft.contact} onChange={(next) => setSection('contact', next)} />;
    }
    return <p className="mono dim">Esta seção entra na próxima etapa.</p>;
  }
```

O botão de descartar entra no cabeçalho, ao lado de "sair":

```jsx
        <button className="admin-button" type="button" onClick={discard} disabled={changed.length === 0}>
          descartar
        </button>
```

- [ ] **Step 9: Acrescentar o CSS das seções**

Adicione ao final de `src/admin/admin.css`:

```css
/* ---------- NAVEGAÇÃO E SEÇÕES ---------- */
.admin-body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 120px;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: sticky;
  top: 20px;
  align-self: start;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
}

.admin-nav-item:hover {
  border-color: var(--border);
}

.admin-nav-item.is-active {
  background: var(--surface);
  border-color: var(--border);
  color: var(--mint);
}

.admin-nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
}

.admin-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.admin-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-field-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  opacity: 0.75;
}

.admin-field-hint {
  margin: 0;
  font-size: 0.78rem;
  opacity: 0.55;
}

/* ---------- LISTAS ---------- */
.admin-string-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-string-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.admin-row-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.admin-icon-button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.8rem;
}

.admin-icon-button:hover:not(:disabled) {
  border-color: var(--mint);
  color: var(--mint);
}

.admin-icon-danger:hover:not(:disabled) {
  border-color: var(--amber);
  color: var(--amber);
}

.admin-icon-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.admin-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.admin-card-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--lilac);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
}

.admin-card-chevron {
  opacity: 0.6;
}

.admin-card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 12px 16px;
  border-top: 1px solid var(--border);
}

@media (max-width: 720px) {
  .admin-body {
    grid-template-columns: 1fr;
  }

  .admin-nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 10: Verificar**

Run: `npm run dev` e abra `/#admin`. Sem backend, a tela mostra o erro de rede — para exercitar os formulários agora, use `vercel dev` se já tiver as variáveis, ou deixe a verificação completa para a Task 14.
Run: `npm test && npm run lint`
Expected: PASS, sem erros de lint.

- [ ] **Step 11: Commit**

```bash
git add src/admin tests
git commit -m "feat: adiciona campos reutilizáveis e as seções simples do painel"
```

---

### Task 12: Seções de experiência e projetos

**Files:**
- Create: `src/admin/sections/CommitsSection.jsx`
- Create: `src/admin/sections/ProjectsSection.jsx`
- Modify: `src/admin/AdminApp.jsx`
- Modify: `src/admin/admin.css`

**Interfaces:**
- Consumes: `emptyCommit`, `emptyRole`, `emptyProject` de `src/data/schema.js`; `Field`, `StringListEditor`, `ListEditor` da Task 11.
- Produces: `CommitsSection({ value, onChange })`, `ProjectsSection({ value, onChange })`.

- [ ] **Step 1: Seção de experiência**

O campo `tag` é `string | null` no dado, e um `<input>` só produz texto. A conversão fica explícita: texto vazio vira `null`.

```jsx
// src/admin/sections/CommitsSection.jsx
import { emptyCommit, emptyRole } from '../../data/schema.js';
import Field from '../fields/Field.jsx';
import ListEditor from '../fields/ListEditor.jsx';
import StringListEditor from '../fields/StringListEditor.jsx';

export default function CommitsSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <p className="admin-field-hint">
        Cada item é um &quot;commit&quot; da carreira. O hash é gerado sozinho e só serve à
        estética do site.
      </p>
      <ListEditor
        items={value}
        onChange={onChange}
        createItem={emptyCommit}
        addLabel="+ adicionar emprego"
        title={(item, index) => `${item.hash || '·······'} ${item.scope || `emprego ${index + 1}`}`}
      >
        {(commit, updateCommit) => (
          <>
            <Field
              label="Identificador"
              value={commit.id}
              onChange={(next) => updateCommit({ ...commit, id: next })}
              hint="Único entre os empregos. Não aparece no site."
            />
            <Field
              label="Escopo"
              value={commit.scope}
              onChange={(next) => updateCommit({ ...commit, scope: next })}
              hint="O nome que aparece depois do hash. ex.: inside-sistemas"
            />
            <Field
              label="Etiqueta"
              value={commit.tag ?? ''}
              onChange={(next) => updateCommit({ ...commit, tag: next.trim() === '' ? null : next })}
              hint="Deixe vazio para não mostrar etiqueta. ex.: Atual"
            />
            <div className="admin-subsection">
              <span className="admin-field-label">Cargos</span>
              <ListEditor
                items={commit.roles}
                onChange={(next) => updateCommit({ ...commit, roles: next })}
                createItem={emptyRole}
                addLabel="+ adicionar cargo"
                title={(role, index) => role.role || `cargo ${index + 1}`}
              >
                {(role, updateRole) => (
                  <>
                    <Field
                      label="Período"
                      value={role.date}
                      onChange={(next) => updateRole({ ...role, date: next })}
                      hint="ex.: Jul de 2026 — o momento · 1 mês · Toledo, Paraná · Tempo integral"
                    />
                    <Field
                      label="Cargo"
                      value={role.role}
                      onChange={(next) => updateRole({ ...role, role: next })}
                    />
                    <StringListEditor
                      label="Adições (+)"
                      items={role.additions}
                      onChange={(next) => updateRole({ ...role, additions: next })}
                      placeholder="O que você fez nesse cargo"
                    />
                    <StringListEditor
                      label="Remoções (−)"
                      items={role.removals}
                      onChange={(next) => updateRole({ ...role, removals: next })}
                      placeholder="O que deixou de ser necessário"
                    />
                    <StringListEditor
                      label="Stack"
                      items={role.stack}
                      onChange={(next) => updateRole({ ...role, stack: next })}
                    />
                  </>
                )}
              </ListEditor>
            </div>
          </>
        )}
      </ListEditor>
    </div>
  );
}
```

- [ ] **Step 2: Seção de projetos**

```jsx
// src/admin/sections/ProjectsSection.jsx
import { emptyProject } from '../../data/schema.js';
import Field from '../fields/Field.jsx';
import ListEditor from '../fields/ListEditor.jsx';
import StringListEditor from '../fields/StringListEditor.jsx';

export default function ProjectsSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <ListEditor
        items={value}
        onChange={onChange}
        createItem={emptyProject}
        addLabel="+ adicionar projeto"
        title={(item, index) => item.name || `projeto ${index + 1}`}
      >
        {(project, update) => (
          <>
            <Field
              label="Identificador"
              value={project.id}
              onChange={(next) => update({ ...project, id: next })}
              hint="Único entre os projetos. Não aparece no site."
            />
            <Field label="Nome" value={project.name} onChange={(next) => update({ ...project, name: next })} />
            <Field
              label="Arquivo"
              value={project.filename}
              onChange={(next) => update({ ...project, filename: next })}
              hint="O nome de arquivo decorativo do card. ex.: barber-foundation.dart"
            />
            <Field
              label="Descrição"
              value={project.description}
              multiline
              onChange={(next) => update({ ...project, description: next })}
            />
            <StringListEditor
              label="Stack"
              items={project.stack}
              onChange={(next) => update({ ...project, stack: next })}
            />
            <Field
              label="Link"
              value={project.href}
              onChange={(next) => update({ ...project, href: next })}
              hint="Precisa começar com https://"
            />
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={project.showInCv}
                onChange={(event) => update({ ...project, showInCv: event.target.checked })}
              />
              aparece no currículo (/#cv)
            </label>
          </>
        )}
      </ListEditor>
    </div>
  );
}
```

- [ ] **Step 3: Ligar as duas seções**

Em `src/admin/AdminApp.jsx`, importe as duas e substitua o fallback de `renderSection`:

```jsx
import CommitsSection from './sections/CommitsSection.jsx';
import ProjectsSection from './sections/ProjectsSection.jsx';
```

```jsx
    if (active === 'commits') {
      return <CommitsSection value={draft.commits} onChange={(next) => setSection('commits', next)} />;
    }
    if (active === 'projects') {
      return <ProjectsSection value={draft.projects} onChange={(next) => setSection('projects', next)} />;
    }
    return null;
```

- [ ] **Step 4: CSS do aninhamento e da caixa de seleção**

Adicione ao final de `src/admin/admin.css`:

```css
.admin-subsection {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 12px;
  border-left: 2px solid var(--border);
}

.admin-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  cursor: pointer;
}

.admin-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--mint);
}
```

- [ ] **Step 5: Rodar testes e lint**

Run: `npm test && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/admin/sections src/admin/AdminApp.jsx src/admin/admin.css
git commit -m "feat: adiciona edição de experiência e projetos no painel"
```

---

### Task 13: Publicação, diff na tela e recuperação de erro

**Files:**
- Create: `src/admin/DiffView.jsx`
- Create: `src/admin/PublishBar.jsx`
- Create: `src/admin/ReauthDialog.jsx`
- Modify: `src/admin/AdminApp.jsx`
- Modify: `src/admin/admin.css`

**Interfaces:**
- Consumes: `sectionDiff`, `collapse`, `commitMessage` da Task 9; `publish`, `login`, `ApiError` da Task 10; `validateContent` de `src/data/schema.js`.
- Produces: `DiffView({ base, draft, sections })`, `PublishBar({ ... })`, `ReauthDialog({ onSubmit, onCancel, busy, error })`.

- [ ] **Step 1: Visualização do diff**

```jsx
// src/admin/DiffView.jsx
import { SECTION_LABELS } from '../data/schema.js';
import { collapse, sectionDiff } from './diff.js';

const PREFIX = { added: '+', removed: '-', context: ' ' };

export default function DiffView({ base, draft, sections }) {
  return (
    <div className="admin-diff">
      {sections.map((key) => {
        const rows = collapse(sectionDiff(base, draft, key));
        return (
          <section className="admin-diff-section" key={key}>
            <h3 className="mono admin-diff-title">~/{SECTION_LABELS[key]}</h3>
            <pre className="admin-diff-body">
              {rows.map((row, index) =>
                row.type === 'gap' ? (
                  // A posição é a identidade: estes itens não têm id próprio.
                  <span className="admin-diff-gap" key={index}>
                    {`  … ${row.count} linhas sem alteração\n`}
                  </span>
                ) : (
                  // A posição é a identidade: estes itens não têm id próprio.
                  <span className={`admin-diff-line is-${row.type}`} key={index}>
                    {`${PREFIX[row.type]} ${row.text}\n`}
                  </span>
                ),
              )}
            </pre>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Diálogo de reautenticação**

```jsx
// src/admin/ReauthDialog.jsx
import { useState } from 'react';

export default function ReauthDialog({ onSubmit, onCancel, busy, error }) {
  const [password, setPassword] = useState('');

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reauth-title">
      <form
        className="admin-modal"
        onSubmit={(event) => {
          event.preventDefault();
          if (password !== '') onSubmit(password);
        }}
      >
        <h2 className="mono admin-modal-title" id="reauth-title">
          sessão expirada
        </h2>
        <p className="admin-field-hint">
          Seu rascunho continua salvo. Entre de novo e a publicação segue do ponto em que parou.
        </p>
        <input
          className="admin-input mono"
          type="password"
          autoComplete="current-password"
          autoFocus
          aria-label="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
        {error ? (
          <p className="admin-login-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-modal-actions">
          <button className="admin-button" type="button" onClick={onCancel} disabled={busy}>
            cancelar
          </button>
          <button className="admin-button-primary" type="submit" disabled={busy || password === ''}>
            {busy ? 'entrando…' : 'entrar e publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Barra de publicação**

```jsx
// src/admin/PublishBar.jsx
import { SECTION_LABELS } from '../data/schema.js';

export default function PublishBar({ changed, onReview, busy, result, error, onDismiss }) {
  if (result) {
    return (
      <div className="admin-publish-bar is-success" role="status">
        <span className="mono">
          commit {result.commitSha.slice(0, 7)} publicado · o site atualiza em cerca de 1 min
        </span>
        <a className="admin-button" href={result.commitUrl} target="_blank" rel="noopener noreferrer">
          ver no GitHub
        </a>
        <button className="admin-button" type="button" onClick={onDismiss}>
          fechar
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-publish-bar is-error" role="alert">
        <span>{error}</span>
        <button className="admin-button" type="button" onClick={onDismiss}>
          fechar
        </button>
      </div>
    );
  }

  if (changed.length === 0) return null;

  return (
    <div className="admin-publish-bar">
      <span className="mono admin-publish-status">
        modificado: {changed.map((key) => SECTION_LABELS[key]).join(', ')}
      </span>
      <button className="admin-button-primary" type="button" onClick={onReview} disabled={busy}>
        commit &amp; publicar
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Ligar tudo no `AdminApp`**

Acrescente aos imports. Note que `publish` entra na linha de import de `./api.js` que já existe desde a Task 10, em vez de virar uma segunda linha para o mesmo módulo:

```jsx
import { ApiError, fetchContent, login, logout, publish } from './api.js';
import DiffView from './DiffView.jsx';
import PublishBar from './PublishBar.jsx';
import ReauthDialog from './ReauthDialog.jsx';
import { commitMessage } from './diff.js';
import { validateContent } from '../data/schema.js';
```

Acrescente aos estados:

```jsx
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishResult, setPublishResult] = useState(null);
  const [reauth, setReauth] = useState(false);
  const [reauthError, setReauthError] = useState(null);
```

Acrescente a lógica de publicação. `doPublish` é separada para que a reautenticação possa reexecutá-la sem duplicar código:

```jsx
  async function doPublish() {
    const validation = validateContent(draft);
    if (!validation.ok) {
      setPublishError(`Corrija antes de publicar — ${validation.errors[0]}`);
      setReviewing(false);
      return;
    }

    setPublishing(true);
    setPublishError(null);
    try {
      const result = await publish({
        content: draft,
        sha: server.sha,
        message: commitMessage(changed),
      });
      setPublishResult(result);
      setReviewing(false);
      setReauth(false);
      // Recarrega do servidor para obter o sha novo; isso também zera o rascunho,
      // porque useDraft descarta o guardado quando o sha muda.
      await load();
    } catch (error) {
      if (error.code === 'unauthenticated') {
        setReauth(true);
      } else if (error.code === 'conflict') {
        setPublishError(
          'O conteúdo mudou no repositório desde que o painel carregou. Recarregue para ver a versão atual — seu rascunho continua salvo neste navegador.',
        );
        setReviewing(false);
      } else {
        setPublishError(error.message);
        setReviewing(false);
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleReauth(password) {
    setReauthError(null);
    setPublishing(true);
    try {
      await login(password);
      setReauth(false);
      setPublishing(false);
      await doPublish();
    } catch (error) {
      setReauthError(error.message);
      setPublishing(false);
    }
  }
```

Acrescente ao JSX, dentro de `.admin`, depois de `.admin-body`:

```jsx
      {reviewing && draft ? (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <div className="admin-modal admin-modal-wide">
            <h2 className="mono admin-modal-title" id="review-title">
              {commitMessage(changed)}
            </h2>
            <DiffView base={server.content} draft={draft} sections={changed} />
            <div className="admin-modal-actions">
              <button className="admin-button" type="button" onClick={() => setReviewing(false)}>
                voltar
              </button>
              <button
                className="admin-button-primary"
                type="button"
                onClick={doPublish}
                disabled={publishing}
              >
                {publishing ? 'publicando…' : 'confirmar e publicar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reauth ? (
        <ReauthDialog
          onSubmit={handleReauth}
          onCancel={() => setReauth(false)}
          busy={publishing}
          error={reauthError}
        />
      ) : null}

      <PublishBar
        changed={changed}
        onReview={() => setReviewing(true)}
        busy={publishing}
        result={publishResult}
        error={publishError}
        onDismiss={() => {
          setPublishResult(null);
          setPublishError(null);
        }}
      />
```

- [ ] **Step 5: CSS da publicação e dos diálogos**

Adicione ao final de `src/admin/admin.css`:

```css
/* ---------- BARRA DE PUBLICAÇÃO ---------- */
.admin-publish-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.admin-publish-bar.is-success {
  border-top-color: var(--mint);
  color: var(--mint);
}

.admin-publish-bar.is-error {
  border-top-color: var(--amber);
  color: var(--amber);
}

.admin-publish-status {
  font-size: 0.82rem;
  opacity: 0.85;
}

/* ---------- DIÁLOGOS ---------- */
.admin-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(13, 17, 23, 0.85);
}

.admin-modal {
  width: min(480px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.admin-modal-wide {
  width: min(860px, 100%);
  max-height: 85vh;
}

.admin-modal-title {
  margin: 0;
  font-size: 0.95rem;
  color: var(--lilac);
}

.admin-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ---------- DIFF ---------- */
.admin-diff {
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-diff-title {
  margin: 0 0 6px;
  font-size: 0.8rem;
  opacity: 0.7;
}

.admin-diff-body {
  margin: 0;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: pre;
  overflow-x: auto;
}

.admin-diff-line.is-added {
  color: var(--mint);
}

.admin-diff-line.is-removed {
  color: var(--amber);
}

.admin-diff-gap {
  opacity: 0.4;
}
```

- [ ] **Step 6: Rodar testes e lint**

Run: `npm test && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 7: Commit**

```bash
git add src/admin
git commit -m "feat: publica o rascunho como commit com revisão de diff"
```

---

### Task 14: Configuração, verificação de ponta a ponta e documentação

**Files:**
- Create: `docs/admin.md`
- Create: `.env.local` (local, não versionado)
- Modify: `PRODUCT.md`

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: procedimento de configuração e o registro do recurso no PRODUCT.md.

- [ ] **Step 1: Criar a branch de teste no GitHub**

```bash
git push origin main:admin-test
```

Publicar contra `admin-test` durante a verificação evita mexer na `main`.

- [ ] **Step 2: Criar o token do GitHub**

No GitHub, em Settings → Developer settings → Personal access tokens → Fine-grained tokens: novo token, repositório apenas `OPaiva-1721/portifolio`, permissão **Contents: Read and write**, validade de 1 ano. Copie o valor — ele só aparece uma vez.

- [ ] **Step 3: Gerar o hash da senha**

Run: `npm run admin:hash`
Use uma senha aleatória de 20+ caracteres vinda de gerenciador de senhas, conforme a decisão registrada na spec. Guarde a senha no gerenciador e copie o hash.

- [ ] **Step 4: Escrever o `.env.local`**

Gere o `SESSION_SECRET` com:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

```
ADMIN_PASSWORD_HASH=scrypt$16384$8$1$...
SESSION_SECRET=...
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=OPaiva-1721/portifolio
GITHUB_BRANCH=admin-test
```

Confirme que o arquivo não será versionado:

```bash
git check-ignore -v .env.local
```
Expected: a saída aponta a regra `.env*` do `.gitignore`. Se não apontar, **pare** e corrija antes de seguir.

- [ ] **Step 5: Verificação de ponta a ponta**

Run: `npx vercel dev` e abra `http://localhost:3000/#admin`.

Percorra e confirme cada item:

1. A tela pede senha. Uma senha errada devolve "Senha incorreta." depois de uma pausa perceptível.
2. A senha certa abre o painel com as seis seções na lateral.
3. Editar a tagline em `~/bio` acende o ponto de modificado ao lado de `~/bio` e faz surgir a barra inferior.
4. Recarregar a página mantém a alteração (rascunho no `localStorage`) e o painel continua autenticado.
5. Em `~/experiência`, adicionar um emprego cria um card com hash de 7 caracteres; adicionar um cargo dentro dele funciona; as setas reordenam; o ✕ pede confirmação.
6. Em `~/projetos`, a caixa "aparece no currículo" alterna.
7. Deixar um campo obrigatório vazio e tentar publicar mostra a mensagem de validação nomeando o campo, sem publicar.
8. Com os campos válidos, "commit & publicar" abre o diff com linhas verdes e vermelhas e a mensagem `content: atualiza ...`.
9. Confirmar publica: a barra mostra o hash do commit e o link. Abra o link e veja o commit na branch `admin-test`.
10. Depois de publicar, a barra de modificações some — o rascunho passou a ser a base.
11. "descartar" com alterações pendentes volta ao conteúdo publicado.
12. "sair" volta à tela de senha, e recarregar continua pedindo senha.

Para exercitar a expiração de sessão sem esperar 8 horas: apague o cookie `portfolio_admin` nas ferramentas do navegador com alterações pendentes e clique em publicar. Esperado: o diálogo de sessão expirada aparece, e entrar de novo conclui a publicação sem perder o rascunho.

Para exercitar o conflito: com o painel aberto, edite `src/data/content.json` direto no GitHub na branch `admin-test`, depois publique pelo painel. Esperado: mensagem de conteúdo alterado no repositório, com o rascunho preservado.

- [ ] **Step 6: Escrever a documentação de operação**

```markdown
<!-- docs/admin.md -->
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
```

- [ ] **Step 7: Registrar o recurso no PRODUCT.md**

Na seção "Operating Context", acrescente uma linha:

```markdown
- Rota `/#admin` abre um painel protegido por senha que edita `src/data/content.json` e publica as alterações como commit no repositório, sem passar pelo código.
```

- [ ] **Step 8: Apontar o ambiente de produção para a `main`**

Na Vercel, confirme que `GITHUB_BRANCH` está como `main` (ou ausente, já que `main` é o padrão) no ambiente de produção. Deixar `admin-test` em produção faria as edições nunca chegarem ao site.

- [ ] **Step 9: Verificação final**

Run: `npm test && npm run lint && npm run build`
Expected: PASS, sem erros, build conclui.

- [ ] **Step 10: Commit**

```bash
git add docs/admin.md PRODUCT.md
git commit -m "docs: documenta a operação do painel de administração"
```

- [ ] **Step 11: Limpar a branch de teste**

```bash
git push origin --delete admin-test
```

---

## Verificação de cobertura da spec

| Requisito da spec | Task |
|---|---|
| Conteúdo em `content.json`, `content.js` como casca | 2 |
| Nenhum componente público alterado | 2 (verificado em 2.7) |
| Rota `#admin` com carregamento lazy | 10 |
| `POST /api/login` | 7 |
| `POST /api/logout` | 7 |
| `GET /api/content` lendo do GitHub | 8 |
| `POST /api/publish` com validação | 8 |
| Zero dependências de runtime | 1 (só vitest em devDependencies) |
| Cinco variáveis de ambiente | 5, 6, 14 |
| Hash scrypt e script de geração | 5 |
| Cookie assinado, httpOnly, Secure, SameSite=Strict, 8h | 5 |
| Atraso fixo e contador em memória no login | 7 |
| Token do GitHub restrito ao servidor | 6 |
| Navegação por seções com rótulos do site | 11 |
| Rascunho em localStorage | 11 |
| Indicador de seções modificadas | 11 |
| Diff antes de publicar | 13 |
| Mensagem de commit automática | 9, 13 |
| Conflito de sha tratado | 13 (verificado em 14.5) |
| Reordenar por setas | 11 |
| Três componentes reutilizáveis | 11 |
| Hash de commit gerado automaticamente | 4, 12 |
| Validação em cliente e servidor | 4, 8, 13 |
| Limite de 256 KB | 4 |
| `showInCv` substituindo o filtro fixo | 3 |
| `showInCv: true` como padrão | 4 |
| Sessão expirada sem perder rascunho | 13 (verificado em 14.5) |
| Limite de erro próprio do painel, sem tela branca | 10 |
| Mensagens de erro específicas | 6, 13 |
| Testes de schema, sessão, senha e migração | 1, 4, 5 |
| `vercel dev` e branch de teste | 14 |
