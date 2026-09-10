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
