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
