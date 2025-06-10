import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import styles from './Home.module.css';
import defaultAvatar from '../assets/default-avatar.svg';
import defaultPost from '../assets/default-post.svg';
import EndOfFeed from '../components/feed/EndOfFeed';
import PostsInfo from '../components/feed/PostsInfo';
import { API_BASE_URL, getAuthHeaders } from '../services/config';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface Post {
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
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const POSTS_PER_PAGE = 5;
  const INITIAL_COMMENTS_SHOW = 2;
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching posts with token:', token);
      
      const response = await fetch(
        `http://localhost:5001/api/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch posts');
      }

      const data = await response.json();
      console.log('Received posts data:', data);
      
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);

      // Проверяем лайки пользователя для каждого поста
      data.posts.forEach((post: Post) => {
        checkUserLike(post._id);
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      
      // Если токен недействителен, перенаправляем на страницу входа
      if (err instanceof Error && err.message.includes('token')) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Intersection Observer setup
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1);
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
  }, [hasMore, loading]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  const checkUserLike = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/likes/${postId}/check`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { hasLiked, likesCount } = await response.json();
        setUserLikes(prev => ({ ...prev, [postId]: hasLiked }));
        // Обновляем количество лайков в посте
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return { ...post, likes: Array(likesCount).fill('') };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/likes/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const { hasLiked } = await response.json();
      setUserLikes(prev => ({ ...prev, [postId]: hasLiked }));
      
      // После успешного переключения лайка, обновляем информацию о лайках
      checkUserLike(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const content = newComments[postId];

      if (!content?.trim()) return;

      if (!token || !userId) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: JSON.stringify({ content }),
      });

      const responseText = await response.text();
      console.log('Response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to add comment';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const newComment = JSON.parse(responseText);

      // Обновляем состояние локально
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

      // Очищаем поле ввода, закрываем форму и сворачиваем комментарии
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
      alert(error instanceof Error ? error.message : 'Failed to add comment. Please try again.');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      console.log('Attempting to delete comment:', { postId, commentId });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authorization token found');
      }

      // Используем правильный URL для удаления комментария
      const url = `http://localhost:5001/api/posts/${postId}/comments/${commentId}`;
      console.log('Delete URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to delete comment';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Обновляем состояние локально, удаляя комментарий
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
      alert(error instanceof Error ? error.message : 'Failed to delete comment. Please try again.');
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

  const renderComment = (post: Post, comment: Comment) => {
    const userId = localStorage.getItem('userId');
    if (!comment || !comment.user) return null;

    return (
      <div key={comment._id} className={styles.comment}>
        <div className={styles.commentContent}>
          <img 
            src={comment.user?.avatar ? `http://localhost:5001${comment.user.avatar}` : defaultAvatar}
            alt={comment.user?.username || 'User'}
            className={styles.commentAvatar}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar;
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
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this comment?')) {
                      handleDeleteComment(post._id, comment._id);
                    }
                  }}
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
    const commentsToShow = isExpanded ? comments : comments.slice(0, INITIAL_COMMENTS_SHOW);
    const hasMoreComments = comments.length > INITIAL_COMMENTS_SHOW;

    return (
      <div key={post._id} className={styles.post}>
        <div className={styles.postHeader}>
          <img 
            src={post.author?.avatar ? `http://localhost:5001${post.author.avatar}` : defaultAvatar} 
            alt={post.author?.username || 'User'} 
            className={styles.avatar}
            onClick={(e) => post.author?.username && handleUsernameClick(post.author.username, e)}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar;
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
        <img 
          src={post.image ? `http://localhost:5001${post.image}` : defaultPost}
          alt="" 
          className={styles.postImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultPost;
          }}
        />
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
        </div>
        <div className={styles.likes}>{post.likes?.length || 0} likes</div>
        {post.description && (
          <div className={styles.caption}>
            <span className={styles.username}>{post.author?.username || 'Unknown User'}</span> {post.description}
          </div>
        )}
        
        {/* Комментарии */}
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

          {/* Форма добавления комментария */}
          <div className={`${styles.addComment} ${isCommentFormActive ? styles.visible : ''}`}>
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
      </div>
    );
  };

  return (
    <div className={styles.homeContainer}>
      <Sidebar />
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
            {!hasMore && <EndOfFeed />}
            {posts.length > 0 && <PostsInfo />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;