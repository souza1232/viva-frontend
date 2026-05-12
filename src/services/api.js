import axios from 'axios';
import { getItem, removeItem } from '../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('viva_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeItem('viva_token');
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// User
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => api.patch('/user/profile', data);

// AI
export const sendMessage = (message) => api.post('/ai/chat', { message });
export const getGreeting = () => api.get('/ai/greeting');
export const getHistory = (limit = 50, offset = 0) =>
  api.get('/ai/history', { params: { limit, offset } });

// Voz — retorna blob de áudio
export const getVoice = async (text) => {
  const response = await api.post('/ai/voice', { text }, { responseType: 'blob' });
  return response.data;
};

// Comunidade
export const getPosts = (params) => api.get('/community/posts', { params });
export const createPost = (data) => api.post('/community/posts', data);
export const replyPost = (postId, content) =>
  api.post(`/community/posts/${postId}/reply`, { content });
export const deletePost = (postId) => api.delete(`/community/posts/${postId}`);

// Relatório
export const getReport = (month, year) =>
  api.get('/user/report', { params: { month, year } });
export const getReportList = () => api.get('/user/report/list');

// Cardápio semanal
export const getMealPlan = (refresh = false) =>
  api.get('/ai/food/meal-plan', { params: refresh ? { refresh: true } : {}, timeout: 120000 });

// Previsão do dia / insights
export const getWorkForecast = (data) => api.post('/ai/forecast', data);
export const getSymptomInsights = () => api.get('/ai/insights');

// Check-in diário
export const saveCheckin = (data) => api.post('/checkin', data);
export const getTodayCheckin = () => api.get('/checkin/today');
export const getCheckins = (days = 30) => api.get('/checkin', { params: { days } });

// Receita completa
export const getRecipe = (mealName, ingredients) =>
  api.post('/ai/food/recipe', { mealName, ingredients });

// Uso do chat
export const getChatUsage = () => api.get('/ai/usage');

// Ritual da manhã
export const getDailyRitual = () => api.get('/ritual/today');
export const completeRitual = () => api.post('/ritual/complete');

// Assinatura
export const getSubscriptionStatus = () => api.get('/subscription/status');
export const createCheckout = () => api.post('/subscription/checkout');
export const createPortalSession = () => api.post('/subscription/portal');

export default api;
