import { api } from './api';
import { User } from '../types';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'ADMIN' | 'PATIENT' | 'COORDINATOR';
    diagnosis?: string;
    primaryDoctor?: string;
    department?: string;
    age?: number;
    gender?: string;
  }): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('recovera_token', response.data.token);
      localStorage.setItem('recovera_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', { email, password: pass });
    if (response.data.token) {
      localStorage.setItem('recovera_token', response.data.token);
      localStorage.setItem('recovera_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    const user = response.data.user;
    localStorage.setItem('recovera_user', JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem('recovera_token');
    localStorage.removeItem('recovera_user');
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('recovera_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('recovera_token');
  },
};

export default authService;
