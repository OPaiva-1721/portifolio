import { describe, it, expect } from 'vitest';
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
