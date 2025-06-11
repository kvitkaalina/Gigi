import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './config';

export interface Post {
  _id: string;
  description?: string;
  image: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export const postService = {
  // Получение постов пользователя
  getUserPosts: async (username: string): Promise<Post[]> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/user/${username}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user posts');
    }

    return response.json();
  },

  // Получение постов для ленты
  getFeedPosts: async (page: number = 1, limit: number = 5): Promise<{ posts: Post[], hasMore: boolean }> => {
    const response = await fetch(
      `${API_BASE_URL}/api/posts?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return handleApiResponse(response);
  },

  // Получение постов для страницы Explore
  getExplorePosts: async (limit: number = 12): Promise<Post[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/search/explore?limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return handleApiResponse(response);
  },

  // Создание нового поста
  createPost: async (formData: FormData): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Не добавляем Content-Type, так как это FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    return response.json();
  },

  // Удаление поста
  deletePost: async (postId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }
  },

  // Получение комментариев поста
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
    return handleApiResponse(response);
  },

  // Добавление комментария
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text: content })
    });
    return handleApiResponse(response);
  },

  // Удаление комментария
  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  }
}; 