import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../constants/app';

const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) err.isNetworkError = true;
    const url = err.config?.url || '';
    const isCredentialCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY) && !isCredentialCall) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

export default api;
