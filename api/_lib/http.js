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
