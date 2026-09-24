import { create } from 'zustand';
import api from './../lib/api';

export const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem('aura_token'),
  loading: true,
  async hydrate() {
    const token = localStorage.getItem('aura_token');
    if (!token) {
      set({ loading: false, user: null });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, loading: false });
    } catch {
      localStorage.removeItem('aura_token');
      set({ user: null, token: null, loading: false });
    }
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('aura_token', data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },
  logout() {
    localStorage.removeItem('aura_token');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'admin',
}));
