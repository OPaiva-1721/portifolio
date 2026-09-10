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
