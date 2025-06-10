import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './config';

export interface Notification {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  actor: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  type: 'like' | 'comment' | 'follow';
  target?: {
    _id: string;
    image?: string;
    description?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  // Получение всех уведомлений
  getNotifications: async (): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Пометить уведомление как прочитанное
  markAsRead: async (notificationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Пометить все уведомления как прочитанные
  markAllAsRead: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Удалить уведомление
  deleteNotification: async (notificationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  }
}; 