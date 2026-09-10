import { clearedSessionCookie } from './_lib/session.js';
import { methodNotAllowed, sendJson } from './_lib/http.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  res.setHeader('Set-Cookie', clearedSessionCookie());
  return sendJson(res, 200, { ok: true });
}
