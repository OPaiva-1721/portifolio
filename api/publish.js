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
