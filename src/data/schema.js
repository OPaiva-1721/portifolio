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
