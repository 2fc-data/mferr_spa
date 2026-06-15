import { api } from './api';
import * as z from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, { message: 'O campo Username ou email é obrigatório' }),
  password: z.string().min(1, { message: 'O campo Senha é obrigatório' }).min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface LoginResponse {
  user: any; // Ideally we map the user type correctly here
}


export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch(e) {
      console.error('Logout request failed:', e);
    }
    sessionStorage.removeItem('user');
    // Dispatch event so React Router can handle navigation without triggering beforeunload
    window.dispatchEvent(new Event('app:logout'));
  },

  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem('user');
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (resetData: { token: string; password: string }) => {
    return api.post('/auth/reset-password', resetData);
  }
};

