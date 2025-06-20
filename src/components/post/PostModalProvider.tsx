import React, { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePostModal } from '../../hooks/usePostModal';
import PostModal from './PostModal';
import type { Post } from '../../services/postService';

interface OpenModalOptions {
  focusCommentId?: string;
  scrollToComments?: boolean;
  onClose?: () => void;
}

interface PostModalContextType {
  openPostModal: (post: Post, options?: OpenModalOptions) => void;
  closeModal: () => void;
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
  const { 
    isModalOpen, 
    selectedPost, 
    focusedCommentId, 
    shouldScrollToComments, 
    openModal, 
    closeModal, 
    customOnClose 
  } = usePostModal();

  const handleClose = () => {
    if (!isModalOpen) return;

    // First, execute the custom handler if it exists
    if (customOnClose) {
      customOnClose();
    } else {
      // Default behavior: go back if we are on a dedicated post page
      const isPostPage = location.pathname.startsWith('/post/');
      if (isPostPage) {
        navigate(-1);
      }
    }
    
    // Finally, always close the modal state
    closeModal();
  };

  const handleLikeUpdate = (postId: string, hasLiked: boolean, likesCount: number) => {
    // This is a placeholder for future functionality if needed
  };

  return (
    <PostModalContext.Provider value={{ openPostModal: openModal, closeModal }}>
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