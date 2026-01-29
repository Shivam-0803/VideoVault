const base = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function apiUrl(path) {
  return `${base}${path}`;
}
