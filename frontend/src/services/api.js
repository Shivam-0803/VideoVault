import axios from 'axios';
import { apiUrl, getToken } from '../utils/api.js';

const client = axios.create({
  baseURL: apiUrl(''),
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

export const videoApi = {
  list: () => client.get('/videos'),
  upload: (formData, onProgress) =>
    client.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  status: (id) => client.get(`/videos/${id}/status`),
  streamUrl: (id) => apiUrl(`/videos/${id}/stream`) + (getToken() ? `?token=${getToken()}` : ''),
  share: (id, userId) => client.post(`/videos/${id}/share`, { userId }),
  delete: (id) => client.delete(`/videos/${id}`),
};

export const userApi = {
  listViewers: () => client.get('/users?role=viewer'),
};
