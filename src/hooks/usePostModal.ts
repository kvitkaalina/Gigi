import { useState, useCallback } from 'react';
import type { Post } from '../services/postService';

interface OpenModalOptions {
  focusCommentId?: string;
  scrollToComments?: boolean;
}

export const usePostModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [focusedCommentId, setFocusedCommentId] = useState<string | undefined>(undefined);
  const [shouldScrollToComments, setShouldScrollToComments] = useState(false);

  const openModal = useCallback((post: Post, options?: OpenModalOptions) => {
    setSelectedPost(post);
    setFocusedCommentId(options?.focusCommentId);
    setShouldScrollToComments(options?.scrollToComments || false);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 0);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPost(null);
      setFocusedCommentId(undefined);
      setShouldScrollToComments(false);
    }, 300);
  }, []);

  return {
    isModalOpen,
    selectedPost,
    focusedCommentId,
    shouldScrollToComments,
    openModal,
    closeModal
  };
}; 