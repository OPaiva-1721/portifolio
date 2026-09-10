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
