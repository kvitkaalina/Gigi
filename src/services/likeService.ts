import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './config';

interface LikeResponse {
  hasLiked: boolean;
  likesCount: number;
}

export const likeService = {
  // Проверка статуса лайка
  checkLikeStatus: async (postId: string): Promise<LikeResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/likes/${postId}/check`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Переключение лайка (поставить/убрать)
  toggleLike: async (postId: string): Promise<LikeResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/likes/${postId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Получение списка лайков поста
  getPostLikes: async (postId: string): Promise<{ likes: any[], count: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/likes/${postId}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  }
}; 