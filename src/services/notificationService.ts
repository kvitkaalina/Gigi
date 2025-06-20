import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './config';
import { Post } from './postService'; // Импортируем тип Post

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
  markAllAsRead: async (): Promise<Notification[]> => {
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
  },

  // Удалить все уведомления
  deleteAllNotifications: async (notificationIds: string[]): Promise<void> => {
    await Promise.all(
      notificationIds.map(id => 
        fetch(`${API_BASE_URL}/api/notifications/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
      )
    );
  },

  getPostById: async (postId: string): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
    return handleApiResponse(response);
  },
}; 