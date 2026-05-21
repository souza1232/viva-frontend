import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('viva_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (email, password) => api.post('/auth/login', { email, password })
export const register = (name, email, password) => api.post('/auth/register', { name, email, password })
export const getProfile = () => api.get('/user/profile')
export const updateProfile = (data) => api.patch('/user/profile', data)
export const sendChat = (message) => api.post('/ai/chat', { message })
export const getGreeting = () => api.get('/ai/greeting')
export const getChatHistory = () => api.get('/ai/history')
export const getVoice = (text) => api.post('/ai/voice', { text }, { responseType: 'arraybuffer' })
export const getPosts = () => api.get('/community/posts')
export const createPost = (content) => api.post('/community/posts', { content })
export const replyPost = (id, content) => api.post(`/community/posts/${id}/reply`, { content })
export const getReport = (month, year) => api.get(`/user/report?month=${month}&year=${year}`)
export const getSubscriptionStatus = () => api.get('/subscription/status')
export const createCheckout = (plan = 'monthly') => api.post('/subscription/checkout', { plan })
export const cancelSubscription = () => api.post('/subscription/cancel')

export default api
