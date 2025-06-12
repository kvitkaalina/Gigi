import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PostModal.module.css';
import defaultAvatar from '../../assets/default-avatar.svg';
import { likeService, postService, commentService } from '../../services';
import type { Post, Comment } from '../../services/postService';
import { API_BASE_URL } from '../../services/config';

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onLikeUpdate?: (postId: string, hasLiked: boolean, likesCount: number) => void;
  isStandalone?: boolean;
  focusedCommentId?: string;
  shouldScrollToComments?: boolean;
}

const PostModal: React.FC<PostModalProps> = ({
  post,
  onClose,
  onLikeUpdate,
  isStandalone,
  focusedCommentId,
  shouldScrollToComments
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.max(0, post?.likes?.length || 0));
  const [comments, setComments] = useState<Comment[]>(post?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = localStorage.getItem('userId');
  
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | undefined>(focusedCommentId);
  const [isHighlightFading, setIsHighlightFading] = useState(false);

  useEffect(() => {
    if (post?._id) {
      checkLikeStatus();
      fetchComments();
    }
  }, [post?._id]);

  useEffect(() => {
    if (shouldScrollToComments && commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldScrollToComments]);

  useEffect(() => {
    if (focusedCommentId) {
      setHighlightedCommentId(focusedCommentId);
      setIsHighlightFading(false);

      // Прокручиваем к комментарию с задержкой для анимации
      const timer = setTimeout(() => {
        const element = document.getElementById(`comment-${focusedCommentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      // Начинаем затухание подсветки через 3 секунды
      const fadeTimer = setTimeout(() => {
        setIsHighlightFading(true);
      }, 3000);

      // Убираем подсветку через 3.3 секунды (после анимации затухания)
      const removeTimer = setTimeout(() => {
        setHighlightedCommentId(undefined);
      }, 3300);

      return () => {
        clearTimeout(timer);
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [focusedCommentId]);

  if (!post || !post._id) {
    console.error('Invalid post data:', post);
    return null;
  }

  const checkLikeStatus = async () => {
    try {
      const { hasLiked, likesCount: serverLikesCount } = await likeService.checkLikeStatus(post._id);
      setIsLiked(hasLiked);
      setLikesCount(Math.max(0, serverLikesCount || 0));
      onLikeUpdate?.(post._id, hasLiked, serverLikesCount);
    } catch (err) {
      console.error('Error checking like status:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(post._id);
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      const { hasLiked, likesCount: serverLikesCount } = await likeService.toggleLike(post._id);
      setIsLiked(hasLiked);
      setLikesCount(Math.max(0, serverLikesCount || 0));
      onLikeUpdate?.(post._id, hasLiked, serverLikesCount);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await commentService.addComment(post._id, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(post._id, commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleCommentClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
    onClose();
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div 
      className={`${styles.overlay} ${isStandalone ? styles.standalone : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageSection}>
          <img
            src={post.image ? `${API_BASE_URL}${post.image}` : defaultAvatar}
            alt={`Post by ${post.author?.username}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar;
            }}
          />
        </div>
        <div className={styles.contentSection}>
          <div className={styles.header}>
            <div className={styles.authorInfo}>
              <img
                src={post.author?.avatar ? `${API_BASE_URL}${post.author.avatar}` : defaultAvatar}
                alt={post.author?.username}
                className={styles.avatar}
                onClick={(e) => handleCommentClick(post.author.username, e)}
              />
              <span
                className={styles.username}
                onClick={(e) => handleCommentClick(post.author.username, e)}
              >
                {post.author?.username}
              </span>
            </div>
            {!isStandalone && (
              <button 
                className={styles.closeButton} 
                onClick={handleModalClose}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {post.description && (
            <div className={styles.description}>
              {post.description}
            </div>
          )}

          <div className={styles.commentsSection} ref={commentsSectionRef}>
            {comments.map(comment => (
              <div
                key={comment._id}
                id={`comment-${comment._id}`}
                className={`
                  ${styles.comment}
                  ${comment._id === highlightedCommentId ? styles.highlighted : ''}
                  ${comment._id === highlightedCommentId && isHighlightFading ? styles.fadeOut : ''}
                `}
                onClick={(e) => handleCommentClick(comment.user.username, e)}
              >
                <div className={styles.commentContent}>
                  <img
                    src={comment.user?.avatar ? `${API_BASE_URL}${comment.user.avatar}` : defaultAvatar}
                    alt={comment.user?.username}
                    className={styles.commentAvatar}
                  />
                  <div className={styles.commentText}>
                    <span className={styles.commentUsername}>
                      {comment.user?.username}
                    </span>
                    <span className={styles.commentBody}>{comment.text}</span>
                    <span className={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {comment.user?._id === userId && (
                    <button
                      className={styles.deleteComment}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComment(comment._id);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
              onClick={handleLike}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
            </button>
            <span className={styles.likesCount}>
              {likesCount} likes
            </span>
          </div>

          <form className={styles.commentForm} onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.commentInput}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={styles.postComment}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostModal;