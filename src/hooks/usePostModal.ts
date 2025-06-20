import { useState } from 'react';
import type { Post } from '../services/postService';

interface OpenModalOptions {
  focusCommentId?: string;
  scrollToComments?: boolean;
  onClose?: () => void;
}

export const usePostModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [focusedCommentId, setFocusedCommentId] = useState<string | undefined>(undefined);
  const [shouldScrollToComments, setShouldScrollToComments] = useState(false);
  const [customOnClose, setCustomOnClose] = useState<(() => void) | null>(null);

  const openModal = (post: Post, options?: OpenModalOptions) => {
    setSelectedPost(post);
    setFocusedCommentId(options?.focusCommentId);
    setShouldScrollToComments(options?.scrollToComments ?? false);
    if (options?.onClose) {
      setCustomOnClose(() => options.onClose);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setFocusedCommentId(undefined);
    setShouldScrollToComments(false);
    setCustomOnClose(null);
  };

  return { isModalOpen, selectedPost, focusedCommentId, shouldScrollToComments, openModal, closeModal, customOnClose };
}; 