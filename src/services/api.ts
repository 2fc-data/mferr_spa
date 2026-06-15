import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Sends the HttpOnly cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepta as respostas para verificar erros de autenticação e desempacotar dados
api.interceptors.response.use(
  (response) => {
    // Se a resposta vier no formato unificado { status, data, timestamp }, desempacota
    if (response.data && response.data.status === 'success' && 'data' in response.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Limpa sessão local e despacha evento de logout
      sessionStorage.removeItem('user');
      window.dispatchEvent(new Event('app:logout'));
    }
    return Promise.reject(error);
  }
);
