const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('qas_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.error ? payload.error : `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const json = (method, path, body) => request(path, { method, body: JSON.stringify(body) });

export function saveSession(session) {
  localStorage.setItem('qas_token', session.token);
  localStorage.setItem('qas_session', JSON.stringify(session));
}

export function loadSession() {
  try { return JSON.parse(localStorage.getItem('qas_session') || 'null'); } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem('qas_token');
  localStorage.removeItem('qas_session');
}
