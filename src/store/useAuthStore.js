import { create } from 'zustand';
import { setItem, getItem, removeItem } from '../utils/storage';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';

const TOKEN_KEY = 'viva_token';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await getItem(TOKEN_KEY);
      if (token) {
        const { data } = await getProfile();
        set({ user: data, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await removeItem(TOKEN_KEY);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await apiLogin({ email, password });
    await setItem(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
    return data.user;
  },

  register: async (formData) => {
    const { data } = await apiRegister(formData);
    await setItem(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
    return data.user;
  },

  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

  logout: async () => {
    await removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
