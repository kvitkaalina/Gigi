import React, { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePostModal } from '../../hooks/usePostModal';
import PostModal from './PostModal';
import type { Post } from '../../services/postService';

interface OpenModalOptions {
  focusCommentId?: string;
  scrollToComments?: boolean;
  preventNavigationOnClose?: boolean;
}

interface PostModalContextType {
  openPostModal: (post: Post, options?: OpenModalOptions) => void;
}

const PostModalContext = createContext<PostModalContextType | undefined>(undefined);

export const usePostModalContext = () => {
  const context = useContext(PostModalContext);
  if (!context) {
    throw new Error('usePostModalContext must be used within a PostModalProvider');
  }
  return context;
};

export const PostModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isModalOpen, selectedPost, focusedCommentId, shouldScrollToComments, openModal, closeModal } = usePostModal();

  const handleClose = () => {
    closeModal();
    // Проверяем, находимся ли мы на странице поста
    if (location.pathname.startsWith('/post/')) {
      // Используем replace вместо navigate(-1), чтобы избежать проблем с историей
      navigate('/', { replace: true });
    }
  };

  const handleLikeUpdate = (postId: string, hasLiked: boolean, likesCount: number) => {
    // Здесь можно добавить обновление состояния поста в родительском компоненте
  };

  return (
    <PostModalContext.Provider value={{ openPostModal: openModal }}>
      {children}
      {isModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={handleClose}
          onLikeUpdate={handleLikeUpdate}
          focusedCommentId={focusedCommentId}
          shouldScrollToComments={shouldScrollToComments}
        />
      )}
    </PostModalContext.Provider>
  );
}; 