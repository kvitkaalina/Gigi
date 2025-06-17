import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: `${API_URL}${API_BASE}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Добавляем перехватчик для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Если получаем 401, значит токен истек или недействителен
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => {
    console.log('Attempting login with:', { ...data, password: '***' });
    return api.post('/auth/login', data);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = '/login';
  },
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

interface FilterOptions {
  sortBy: 'recent' | 'popular' | 'trending';
  timeFrame: 'today' | 'week' | 'month' | 'all';
  contentType: 'all' | 'photos' | 'videos';
}

export const searchAPI = {
  searchUsers: (query: string) => api.get(`/search/users?query=${encodeURIComponent(query)}`),
  getExploreContent: (limit: number = 12) => api.get(`/search/explore?limit=${limit}`)
};

export default api; 