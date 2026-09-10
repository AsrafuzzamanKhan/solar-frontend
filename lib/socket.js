import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// One shared, lazily-created connection per tab, authenticated with the same JWT
// used for REST calls. Returns null when logged out — callers should no-op.
export function getSocket() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, { auth: { token }, autoConnect: true });
  } else if (socket.auth?.token !== token) {
    // Session changed (e.g. re-login as a different user) — reconnect with the new token.
    socket.auth = { token };
    socket.disconnect().connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
