import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL; // should end in /api

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 🔐 Request Interceptor — Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response Interceptor — Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (preferences: any) =>
    api.put('/auth/preferences', preferences),
};

// ✅ Tasks API
export const tasksAPI = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (task: any) => api.post('/tasks', task),
  updateTask: (id: string, task: any) => api.put(`/tasks/${id}`, task),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
};

// ✅ Habits API
export const habitsAPI = {
  getHabits: (params?: any) => api.get('/habits', { params }),
  getHabit: (id: string) => api.get(`/habits/${id}`),
  createHabit: (habit: any) => api.post('/habits', habit),
  updateHabit: (id: string, habit: any) => api.put(`/habits/${id}`, habit),
  deleteHabit: (id: string) => api.delete(`/habits/${id}`),
  completeHabit: (id: string, date?: string) =>
    api.post(`/habits/${id}/complete`, { date }),
  incompleteHabit: (id: string, date?: string) =>
    api.post(`/habits/${id}/incomplete`, { date }),
};

// ✅ Focus API
export const focusAPI = {
  getSessions: (params?: any) => api.get('/focus', { params }),
  getStats: () => api.get('/focus/stats'),
  createSession: (session: any) => api.post('/focus', session),
  updateSession: (id: string, session: any) =>
    api.put(`/focus/${id}`, session),
  completeSession: (id: string, notes?: string) =>
    api.put(`/focus/${id}/complete`, { notes }),
  deleteSession: (id: string) => api.delete(`/focus/${id}`),
};

// ✅ Notes API
export const notesAPI = {
  getNotes: (params?: any) => api.get('/notes', { params }),
  getNote: (id: string) => api.get(`/notes/${id}`),
  createNote: (note: any) => api.post('/notes', note),
  updateNote: (id: string, note: any) => api.put(`/notes/${id}`, note),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
  getTags: () => api.get('/notes/tags/all'),
};

// ✅ Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: (period?: string) =>
    api.get('/dashboard/analytics', { params: { period } }),
};

export default api;
