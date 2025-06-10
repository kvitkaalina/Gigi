import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './config';
import type { User } from './userService';
import type { Post } from './postService';

export interface SearchUser {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
}

interface SearchResults {
  users: SearchUser[];
  posts: Post[];
}

export const searchService = {
  // Поиск по пользователям и постам
  search: async (query: string): Promise<SearchResults> => {
    const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Поиск только по пользователям
  searchUsers: async (query: string): Promise<SearchUser[]> => {
    const response = await fetch(`${API_BASE_URL}/api/search/users?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Поиск только по постам
  searchPosts: async (query: string): Promise<Post[]> => {
    const response = await fetch(`${API_BASE_URL}/api/search/posts?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Получение рекомендаций для поиска
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/search/suggestions?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Получение постов для страницы Explore
  getExplorePosts: async (limit: number = 12): Promise<Post[]> => {
    const response = await fetch(`${API_BASE_URL}/api/search/explore?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  }
}; 