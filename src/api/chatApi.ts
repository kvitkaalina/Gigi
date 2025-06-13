import axios, { AxiosError } from 'axios';
import { IMessage, IChat, IUser } from '../types/chat';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для установки токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработчик ошибок
const handleError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  throw error;
};

const chatApi = {
  // Получение списка чатов
  getChats: async (): Promise<IChat[]> => {
    try {
      const response = await api.get<IChat[]>('/messages/chats');
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Получение истории сообщений с конкретным пользователем
  getMessages: async (userId: string): Promise<IMessage[]> => {
    try {
      const response = await api.get<IMessage[]>(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Отправка сообщения
  sendMessage: async (userId: string, content: string, type: 'text' | 'image' = 'text', file?: File): Promise<IMessage> => {
    try {
      let data: any;
      let config: any = {};
      if (type === 'image' && file) {
        data = new FormData();
        data.append('type', 'image');
        data.append('file', file);
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        data = { content, type: 'text' };
        // Не передаём headers, чтобы axios сам поставил application/json
      }
      const response = await api.post<IMessage>(`/messages/${userId}`, data, config);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Отметить сообщения как прочитанные
  markAsRead: async (userId: string): Promise<void> => {
    try {
      await api.put(`/messages/${userId}/read`);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Поиск пользователей
  searchUsers: async (query: string): Promise<IUser[]> => {
    try {
      const response = await api.get<IUser[]>('/search/users', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Создание нового чата
  createChat: async (userId: string): Promise<IChat> => {
    try {
      const response = await api.post<IChat>('/messages/chats', { userId });
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Удаление сообщения
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Редактирование сообщения
  editMessage: async (messageId: string, content: string): Promise<void> => {
    try {
      await api.patch(`/messages/${messageId}`, { content });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  }
};

export default chatApi; 