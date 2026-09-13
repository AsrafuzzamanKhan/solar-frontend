const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// A stable per-browser id sent as a header, paired (informationally) with the
// backend's own IP+User-Agent fingerprint for new-device login detection.
function getDeviceId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem('deviceId', id);
  }
  return id;
}

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  emitSessionChange();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const deviceId = getDeviceId();
  if (deviceId) headers['X-Device-Id'] = deviceId;
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    handleUnauthorized();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    // Some error responses carry extra fields (e.g. login's { needsOtp, userId }
    // when the account isn't verified yet) that callers need to act on.
    err.data = data;
    throw err;
  }
  return data;
}

// Multipart upload (e.g. product images) — bypasses the JSON content-type above.
async function upload(path, formData) {
  const headers = {};
  const deviceId = getDeviceId();
  if (deviceId) headers['X-Device-Id'] = deviceId;
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData });
  if (res.status === 401) handleUnauthorized();

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

export const api = {
  get: (path, opts = {}) => request(path, opts),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload,
};

// Session as a subscribable store (React's useSyncExternalStore pattern) — so a
// component like the navbar avatar updates the instant login/logout happens,
// instead of only reading localStorage once on mount and needing a full page
// reload to notice anything changed.
const listeners = new Set();

function emitSessionChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  // Also react to another tab logging in/out (native storage event only fires
  // cross-tab, never in the tab that made the change — that's covered by emitSessionChange).
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  emitSessionChange();
}

// Cached by the raw string it was parsed from, so repeated calls return the exact
// same object reference when localStorage hasn't actually changed. This isn't just
// an optimization — useSyncExternalStore (Navbar) compares snapshots with Object.is
// and re-renders whenever it sees a new reference; JSON.parse-ing fresh on every
// call would hand it a new object every render and loop forever.
let cachedRaw;
let cachedUser;

export function getSession() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? JSON.parse(raw) : null;
  }
  return cachedUser;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  emitSessionChange();
}
