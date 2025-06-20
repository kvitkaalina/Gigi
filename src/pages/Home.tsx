import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import MobileNav from '../components/navigation/MobileNav';
import styles from './Home.module.css';
import defaultPost from '../assets/default-post.svg';
import EndOfFeed from '../components/feed/EndOfFeed';
import PostsInfo from '../components/feed/PostsInfo';
import { API_BASE_URL, getAuthHeaders } from '../services/config';
import type { Post, Comment } from '../services/postService';
import { commentService } from '../services/commentService';
import Picker from '@emoji-mart/react';
import RepostModal from '../components/post/RepostModal';
import { chatService } from '../services/chatService';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [activeCommentForm, setActiveCommentForm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isPreloading, setIsPreloading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const POSTS_PER_PAGE = 10;
  const PRELOAD_THRESHOLD = 0.5;
  const navigate = useNavigate();
  const [doubleTapLike, setDoubleTapLike] = useState<string | null>(null);
  const [updatingLikes, setUpdatingLikes] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<{[postId: string]: boolean}>({});
  const inputRefs = useRef<{[postId: string]: HTMLInputElement | null}>({});
  const [emojiPickerCoords, setEmojiPickerCoords] = useState<{[postId: string]: {left: number, top: number} | null}>({});
  const emojiButtonRefs = useRef<{[postId: string]: HTMLButtonElement | null}>({});
  const pickerHeight = 370; // Примерная высота emoji-пикера
  const [showRepostModalForPostId, setShowRepostModalForPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (pageNum: number = 1, isPreload: boolean = false) => {
    try {
      if (!isPreload) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(
        `http://localhost:5001/api/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      // Получаем актуальное состояние лайков для каждого поста
      const postsWithLikes = await Promise.all(data.posts.map(async (post: Post) => {
        try {
          const likeResponse = await fetch(
            `http://localhost:5001/api/likes/check/${post._id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (likeResponse.ok) {
            const { hasLiked, likesCount } = await likeResponse.json();
            return {
              ...post,
              likesCount,
              isLiked: hasLiked
            };
          }
          return post;
        } catch (error) {
          console.error(`Error fetching likes for post ${post._id}:`, error);
          return post;
        }
      }));
      
      if (!isPreload) {
        if (pageNum === 1) {
          setPosts(postsWithLikes);
        } else {
          setPosts(prev => [...prev, ...postsWithLikes]);
        }
        
        // Обновляем состояние лайков для всех постов
        const newUserLikes: Record<string, boolean> = {};
        postsWithLikes.forEach((post: Post) => {
          newUserLikes[post._id] = post.isLiked || false;
        });
        setUserLikes(prev => ({ ...prev, ...newUserLikes }));
      } else {
        sessionStorage.setItem(`posts_page_${pageNum}`, JSON.stringify(postsWithLikes));
      }

      setHasMore(data.hasMore);
      
      if (data.hasMore && !isPreload) {
        preloadNextPage(pageNum + 1);
      }

    } catch (err) {
      console.error('Error fetching posts:', err);
      if (!isPreload) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
        setHasMore(false);
      }
    } finally {
      if (!isPreload) {
        setLoading(false);
      }
    }
  }, []);

  const preloadNextPage = useCallback(async (nextPage: number) => {
    if (!isPreloading) {
      setIsPreloading(true);
      await fetchPosts(nextPage, true);
      setIsPreloading(false);
    }
  }, [fetchPosts, isPreloading]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: PRELOAD_THRESHOLD
    };

    observer.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasMore && !loading && !isPreloading) {
        const nextPage = page + 1;
        const cachedData = sessionStorage.getItem(`posts_page_${nextPage}`);
        if (cachedData) {
          setPosts(prev => [...prev, ...JSON.parse(cachedData)]);
          sessionStorage.removeItem(`posts_page_${nextPage}`);
          setPage(nextPage);
        } else {
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      }
    }, options);

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, page, fetchPosts, isPreloading]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    console.log('Component state:', {
      postsLength: posts.length,
      loading,
      hasMore,
      error,
      currentPage: page
    });
  }, [posts.length, loading, hasMore, error, page]);

  useEffect(() => {
    console.log('EndOfFeed conditions:', {
      loading,
      hasMore,
      postsLength: posts.length,
      shouldShow: !loading && !hasMore && posts.length > 0
    });
  }, [loading, hasMore, posts.length]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      chatService.connect(token);
    }
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/${postId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const { hasLiked, likesCount } = await response.json();
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, isLiked: hasLiked, likesCount }
            : post
        )
      );

      setUserLikes(prev => ({
        ...prev,
        [postId]: hasLiked
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleImageDoubleClick = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (!post?.isLiked) {
      setDoubleTapLike(postId);
      await handleLike(postId);
      setTimeout(() => setDoubleTapLike(null), 800);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    try {
      const content = newComments[postId];

      if (!content?.trim()) return;

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Not authenticated');
      }

      const newComment = await commentService.addComment(postId, content.trim());

      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [newComment, ...post.comments]
            };
          }
          return post;
        })
      );

      setNewComments(prev => ({
        ...prev,
        [postId]: ''
      }));
      setActiveCommentForm(null);
      setExpandedComments(prev => ({
        ...prev,
        [postId]: false
      }));
      toggleComments(postId);

      console.log('Comment successfully added');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to add comment. Please try again.');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      console.log('Attempting to delete comment:', { postId, commentId });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authorization token found');
      }

      await commentService.deleteComment(postId, commentId);

      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment._id !== commentId)
            };
          }
          return post;
        })
      );

      console.log('Comment successfully deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete comment. Please try again.');
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentIconClick = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleComments(postId);
    setActiveCommentForm(prev => prev === postId ? null : postId);
  };

  const handleUsernameClick = (username: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/profile/${username}`);
  };

  const handleRepost = async (chatId: string, comment: string) => {
    if (showRepostModalForPostId) {
      try {
        await chatService.sendMessage(
          chatId,
          '',
          'repost',
          showRepostModalForPostId,
          comment
        );
        setShowRepostModalForPostId(null);
      } catch (error) {
        console.error('Failed to repost:', error);
      }
    }
  };

  const handleEmojiSelect = (postId: string, emoji: any) => {
    const inputRef = inputRefs.current[postId];
    if (!inputRef) return;
    
    const start = inputRef.selectionStart ?? 0;
    const end = inputRef.selectionEnd ?? 0;
    const text = newComments[postId] || '';
    const newText = text.substring(0, start) + emoji.native + text.substring(end);
    setNewComments(prev => ({ ...prev, [postId]: newText }));
    
    setTimeout(() => {
      inputRef.focus();
      const newCursorPos = start + emoji.native.length;
      inputRef.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    setShowEmojiPicker(prev => ({ ...prev, [postId]: false }));
  };

  const handleEmojiButtonClick = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setShowEmojiPicker(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!showEmojiPicker[postId]) {
      const btn = emojiButtonRefs.current[postId];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        let top = rect.bottom + 6;
        if (window.innerHeight - rect.bottom < pickerHeight) {
          top = rect.top - pickerHeight - 6;
        }
        setEmojiPickerCoords(prev => ({
          ...prev,
          [postId]: {
            left: rect.left,
            top
          }
        }));
      }
    }
  };

  const handleOpenRepostModal = (post: Post) => {
    setShowRepostModalForPostId(post._id);
  };

  const renderComment = (post: Post, comment: Comment) => {
    const userId = localStorage.getItem('userId');
    if (!comment || !comment.user) return null;

    return (
      <div key={comment._id} className={styles.comment}>
        <div className={styles.commentContent}>
          <img 
            src={comment.user?.avatar ? `http://localhost:5001${comment.user.avatar}` : '/images/my-avatar-placeholder.png'}
            alt={comment.user?.username || 'User'}
            className={styles.commentAvatar}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/my-avatar-placeholder.png';
            }}
          />
          <div className={styles.commentText}>
            <div className={styles.commentHeader}>
              <span 
                className={styles.username}
                onClick={(e) => comment.user?.username && handleUsernameClick(comment.user.username, e)}
              >
                {comment.user?.username || 'Unknown User'}
              </span>
              {comment.user?._id === userId && (
                <button
                  className={styles.deleteComment}
                  onClick={() => handleDeleteComment(post._id, comment._id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
            <span className={styles.commentBody}>{comment.text}</span>
            <div className={styles.commentMeta}>
              <span className={styles.timestamp}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPost = (post: Post) => {
    if (!post || !post.author) return null;

    const isLiked = userLikes[post._id] || false;
    const userId = localStorage.getItem('userId');
    const isExpanded = expandedComments[post._id] || false;
    const isCommentFormActive = activeCommentForm === post._id;
    const comments = post.comments || [];
    const commentsToShow = isExpanded ? comments : comments.slice(0, 2);
    const hasMoreComments = comments.length > 2;

    return (
      <div key={post._id} className={styles.post}>
        <div className={styles.postHeader}>
          <img 
            src={post.author?.avatar ? `http://localhost:5001${post.author.avatar}` : '/images/my-avatar-placeholder.png'} 
            alt={post.author?.username || 'User'} 
            className={styles.avatar}
            onClick={(e) => post.author?.username && handleUsernameClick(post.author.username, e)}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/my-avatar-placeholder.png';
            }}
          />
          <span 
            className={styles.username}
            onClick={(e) => post.author?.username && handleUsernameClick(post.author.username, e)}
            style={{ cursor: 'pointer' }}
          >
            {post.author?.username || 'Unknown User'}
          </span>
        </div>
        
        <div 
          className={styles.postImageContainer} 
          onDoubleClick={() => handleImageDoubleClick(post._id)}
        >
          <img
            src={post.image ? `${API_BASE_URL}${post.image}` : defaultPost}
            alt="Post"
            className={styles.postImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultPost;
            }}
          />
          {doubleTapLike === post._id && (
            <i className={`fas fa-heart ${styles.doubleTapHeart} ${styles.active}`}></i>
          )}
        </div>

        <div className={styles.postActions}>
          <button 
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
            onClick={() => handleLike(post._id)}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
          </button>
          <button 
            className={`${styles.actionButton} ${isCommentFormActive ? styles.active : ''}`}
            onClick={(e) => handleCommentIconClick(post._id, e)}
          >
            <i className="far fa-comment"></i>
            {comments.length > 0 && (
              <span className={styles.commentCount}>{comments.length}</span>
            )}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => handleOpenRepostModal(post)}
            title="Share"
          >
            <i className="fas fa-paper-plane" style={{ color: '#3a5e63' }}></i>
          </button>
        </div>
        <div className={`${styles.likes} ${updatingLikes === post._id ? styles.updating : ''}`}>
          {post.likesCount || post.likes?.length || 0} likes
        </div>
        {post.description && (
          <div className={styles.caption}>
            <span className={styles.username}>{post.author?.username || 'Unknown User'}</span> {post.description}
          </div>
        )}
        
        <div className={`${styles.commentsSection} ${isExpanded ? styles.expanded : ''}`}>
          {comments.length > 0 && (
            <>
              <div className={styles.commentsHeader}>
                <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                {hasMoreComments && (
                  <button 
                    className={styles.toggleComments}
                    onClick={() => toggleComments(post._id)}
                  >
                    {isExpanded ? 'Show less' : 'Show all'}
                  </button>
                )}
              </div>
              <div className={styles.comments}>
                {commentsToShow.map(comment => renderComment(post, comment))}
              </div>
            </>
          )}

          <div className={`${styles.addComment} ${isCommentFormActive ? styles.visible : ''}`} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.emojiButton}
              ref={el => (emojiButtonRefs.current[post._id] = el)}
              onClick={e => handleEmojiButtonClick(post._id, e)}
              tabIndex={-1}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', marginRight: 8 }}
              aria-label="Add emoji"
            >
              😊
            </button>
            {showEmojiPicker[post._id] && emojiPickerCoords[post._id] && (
              <div style={{
                position: 'fixed',
                left: emojiPickerCoords[post._id]!.left,
                top: emojiPickerCoords[post._id]!.top,
                zIndex: 9999,
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                borderRadius: 16,
                background: '#fff'
              }}>
                <Picker 
                  onEmojiSelect={(emoji: { native: string }) => handleEmojiSelect(post._id, emoji)} 
                  theme="light" 
                />
              </div>
            )}
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComments[post._id] || ''}
              onChange={(e) => setNewComments(prev => ({
                ...prev,
                [post._id]: e.target.value
              }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCommentSubmit(post._id);
                }
              }}
              className={styles.commentInput}
              ref={el => (inputRefs.current[post._id] = el)}
              onBlur={() => setTimeout(() => setShowEmojiPicker(prev => ({ ...prev, [post._id]: false })), 200)}
            />
            <button
              onClick={() => handleCommentSubmit(post._id)}
              className={styles.postCommentButton}
              disabled={!newComments[post._id]?.trim()}
            >
              Post
            </button>
          </div>
        </div>
        {showRepostModalForPostId === post._id && (
          <RepostModal
            postId={post._id}
            onClose={() => setShowRepostModalForPostId(null)}
            onRepost={handleRepost}
            sourcePage="home"
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.homeContainer}>
      <Sidebar />
      <MobileNav />
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}
        {loading && posts.length === 0 ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : (
          <div className={styles.posts}>
            {posts.map((post, index) => (
              <div
                key={post._id}
                ref={index === posts.length - 1 ? lastPostRef : null}
              >
                {renderPost(post)}
              </div>
            ))}
            {!loading && !hasMore && posts.length > 0 && (
              <div className={styles.endOfFeedContainer}>
                <EndOfFeed />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;