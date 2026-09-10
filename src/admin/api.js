export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function call(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { credentials: 'same-origin', ...options });
  } catch {
    throw new ApiError({
      code: 'network',
      status: 0,
      message: 'Sem conexão com o servidor. Seu rascunho continua salvo.',
    });
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError({
      code: body?.error ?? 'unknown',
      status: response.status,
      message: body?.message ?? 'Algo falhou no servidor.',
      details: body?.details,
    });
  }

  return body;
}

function jsonPost(path, payload) {
  return call(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function login(password) {
  return jsonPost('/api/login', { password });
}

export function logout() {
  return jsonPost('/api/logout', {});
}

export function fetchContent() {
  return call('/api/content');
}

export function publish({ content, sha, message }) {
  return jsonPost('/api/publish', { content, sha, message });
}
