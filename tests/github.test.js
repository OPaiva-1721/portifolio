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
