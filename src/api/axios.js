// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8090/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (
    token &&
    !config.url.endsWith('/auth/login') &&
    !config.url.endsWith('/auth/signup')
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
