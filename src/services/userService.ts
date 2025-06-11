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
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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
    const response = await fetch(`${API_BASE_URL}/api/follow/followers/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Получение подписок
  getFollowing: async (userId: string): Promise<FollowUser[]> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/following/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Проверка статуса подписки
  checkFollowStatus: async (userId: string): Promise<{ following: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/check/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Подписка/отписка
  toggleFollow: async (userId: string, isFollowing: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/${userId}`, {
      method: isFollowing ? 'DELETE' : 'POST',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  }
}; 