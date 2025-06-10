import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface AuthResponse {
  token: string;
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  username: string;
  fullName: string;
}

export const authService = {
  // Регистрация
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  },

  // Вход
  login: async (data: LoginData): Promise<AuthResponse> => {
    console.log('Attempting login with data:', { ...data, password: '***' });
    
    try {
      const cleanedData = {
        ...data,
        email: data.email.trim()
      };
      const response = await api.post('/auth/login', cleanedData);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  },

  // Проверка токена и получение данных пользователя
  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Auth check failed');
      }
      throw error;
    }
  },

  // Выход
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }
}; 