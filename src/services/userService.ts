import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './config';

export interface User {
  _id: string;
  username: string;
  fullName: string;
  bio: string;
  avatar: string;
  followers: string[];
  following: string[];
}

export interface FollowUser {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export const userService = {
  // Получение профиля пользователя
  getProfile: async (username: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile/${username}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Обновление профиля
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  },

  // Обновление аватара
  updateAvatar: async (formData: FormData): Promise<{ avatar: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return handleApiResponse(response);
  },

  // Получение подписчиков
  getFollowers: async (userId: string): Promise<FollowUser[]> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/${userId}/followers`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Получение подписок
  getFollowing: async (userId: string): Promise<FollowUser[]> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/${userId}/following`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Проверка статуса подписки
  checkFollowStatus: async (userId: string): Promise<{ following: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/${userId}/following/check`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Подписка/отписка
  toggleFollow: async (userId: string, isFollowing: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/${userId}/follow`, {
      method: isFollowing ? 'DELETE' : 'POST',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  }
}; 