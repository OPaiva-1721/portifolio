import { verifyPassword } from './_lib/password.js';
import { createSessionToken, sessionCookie } from './_lib/session.js';
import { delay, isJsonRequest, methodNotAllowed, sendJson } from './_lib/http.js';

const FAILURE_DELAY_MS = 600;

// Freio barato contra script ingênuo. Vale por instância quente, não entre instâncias —
// a defesa real é uma senha aleatória longa, conforme decidido na spec.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = { count: 0, resetAt: 0 };

function tooManyFailures(now) {
  if (now > failures.resetAt) {
    failures.count = 0;
    failures.resetAt = now + WINDOW_MS;
  }
  return failures.count >= MAX_FAILURES;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isJsonRequest(req)) {
    return sendJson(res, 415, { error: 'unsupported_media_type', message: 'Envie JSON' });
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;
  if (!storedHash || !secret) {
    console.error('login: ADMIN_PASSWORD_HASH ou SESSION_SECRET ausente no ambiente');
    await delay(FAILURE_DELAY_MS);
    return sendJson(res, 500, {
      error: 'server_misconfigured',
      message: 'O servidor não está configurado. Confira as variáveis de ambiente na Vercel.',
    });
  }

  const now = Date.now();
  if (tooManyFailures(now)) {
    await delay(FAILURE_DELAY_MS);
    return sendJson(res, 429, {
      error: 'too_many_attempts',
      message: 'Muitas tentativas. Espere alguns minutos.',
    });
  }

  const password = req.body?.password;
  const ok = typeof password === 'string' && (await verifyPassword(password, storedHash));

  if (!ok) {
    failures.count += 1;
    await delay(FAILURE_DELAY_MS);
    return sendJson(res, 401, { error: 'invalid_credentials', message: 'Senha incorreta.' });
  }

  failures.count = 0;
  res.setHeader('Set-Cookie', sessionCookie(createSessionToken(secret)));
  return sendJson(res, 200, { ok: true });
}
