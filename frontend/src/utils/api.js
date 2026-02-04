import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Trucks
export const trucksApi = {
  getAll: (params) => api.get('/trucks', { params }),
  getOne: (id) => api.get(`/trucks/${id}`),
  create: (data) => api.post('/trucks', data),
  update: (id, data) => api.put(`/trucks/${id}`, data),
  delete: (id) => api.delete(`/trucks/${id}`),
};

// Test Records
export const testRecordsApi = {
  getByTruck: (truckId) => api.get(`/test-records/truck/${truckId}`),
  create: (data) => api.post('/test-records', data),
  delete: (id) => api.delete(`/test-records/${id}`),
};

// Reminders
export const remindersApi = {
  getAll: (params) => api.get('/reminders', { params }),
  getByTruck: (truckId) => api.get(`/reminders/truck/${truckId}`),
  create: (data) => api.post('/reminders', data),
  delete: (id) => api.delete(`/reminders/${id}`),
  markSent: (id) => api.patch(`/reminders/${id}/send`),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getByFleetTag: () => api.get('/dashboard/by-fleet-tag'),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  updateCompany: (data) => api.put('/settings/company', data),
  updateSchedule: (data) => api.put('/settings/schedule', data),
  updateReminders: (data) => api.put('/settings/reminders', data),
  changePassword: (data) => api.put('/settings/password', data),
};

export default api;
