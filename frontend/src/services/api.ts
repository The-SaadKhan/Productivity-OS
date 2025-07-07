import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // ✅ if you're using cookies or want secure cross-origin requests
});


// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
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
    api.post('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => 
    api.post('/api/auth/register', { name, email, password }),
  getMe: () => 
    api.get('/api/auth/me'),
  updatePreferences: (preferences: any) => 
    api.put('/api/auth/preferences', preferences),
};

// ✅ Tasks API
export const tasksAPI = {
  getTasks: (params?: any) => 
    api.get('/api/tasks', { params }),
  getTask: (id: string) => 
    api.get(`/api/tasks/${id}`),
  createTask: (task: any) => 
    api.post('/api/tasks', task),
  updateTask: (id: string, task: any) => 
    api.put(`/api/tasks/${id}`, task),
  deleteTask: (id: string) => 
    api.delete(`/api/tasks/${id}`),
};

// ✅ Habits API
export const habitsAPI = {
  getHabits: (params?: any) => 
    api.get('/api/habits', { params }),
  getHabit: (id: string) => 
    api.get(`/api/habits/${id}`),
  createHabit: (habit: any) => 
    api.post('/api/habits', habit),
  updateHabit: (id: string, habit: any) => 
    api.put(`/api/habits/${id}`, habit),
  deleteHabit: (id: string) => 
    api.delete(`/api/habits/${id}`),
  completeHabit: (id: string, date?: string) => 
    api.post(`/api/habits/${id}/complete`, { date }),
  incompleteHabit: (id: string, date?: string) => 
    api.post(`/api/habits/${id}/incomplete`, { date }),
};

// ✅ Focus API
export const focusAPI = {
  getSessions: (params?: any) => 
    api.get('/api/focus', { params }),
  getStats: () => 
    api.get('/api/focus/stats'),
  createSession: (session: any) => 
    api.post('/api/focus', session),
  updateSession: (id: string, session: any) => 
    api.put(`/api/focus/${id}`, session),
  completeSession: (id: string, notes?: string) => 
    api.put(`/api/focus/${id}/complete`, { notes }),
  deleteSession: (id: string) => 
    api.delete(`/api/focus/${id}`),
};

// ✅ Notes API
export const notesAPI = {
  getNotes: (params?: any) => 
    api.get('/api/notes', { params }),
  getNote: (id: string) => 
    api.get(`/api/notes/${id}`),
  createNote: (note: any) => 
    api.post('/api/notes', note),
  updateNote: (id: string, note: any) => 
    api.put(`/api/notes/${id}`, note),
  deleteNote: (id: string) => 
    api.delete(`/api/notes/${id}`),
  getTags: () => 
    api.get('/api/notes/tags/all'),
};

// ✅ Dashboard API
export const dashboardAPI = {
  getStats: () => 
    api.get('/api/dashboard/stats'),
  getAnalytics: (period?: string) => 
    api.get('/api/dashboard/analytics', { params: { period } }),
};

export default api;
