import { Comment } from './postService';
import { api } from '../config';

export const commentService = {
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (postId: string, text: string): Promise<Comment> => {
    const response = await api.post(`/posts/${postId}/comments`, { text });
    return response.data;
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  },

  updateComment: async (postId: string, commentId: string, text: string): Promise<Comment> => {
    const response = await api.put(`/posts/${postId}/comments/${commentId}`, { text });
    return response.data;
  }
}; 