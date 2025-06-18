import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Explore.module.css';
import Sidebar from '../components/navigation/Sidebar';
import MobileNav from '../components/navigation/MobileNav';
import PostsInfo from '../components/feed/PostsInfo';
import { searchService } from '../services';
import type { Post } from '../services/postService';
import { getAssetUrl } from '../utils/urls';

// Константы для сетки 3x4
const GRID_COLUMNS = 3;
const GRID_ROWS = 4;
const POSTS_PER_PAGE = GRID_COLUMNS * GRID_ROWS; // 12 постов

const Explore: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchExplorePosts = async () => {
    try {
      setLoading(true);
      const explorePosts = await searchService.getExplorePosts(POSTS_PER_PAGE);
      setPosts(explorePosts);
    } catch (err) {
      console.error('Error fetching explore posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const handlePostClick = (post: Post) => {
    navigate(`/profile/${post.author.username}`);
  };

  const handleAuthorClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.exploreContainer}>
      <Sidebar />
      <MobileNav />
      <div className={styles.explorePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Explore</h1>
          <button onClick={fetchExplorePosts} className={styles.refreshButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.85.99 6.57 2.57L21 8M21 3v5h-5"/>
            </svg>
            Refresh Feed
          </button>
        </div>
        <div className={styles.grid}>
          {posts.map((post) => (
            <div
              key={post._id}
              className={styles.gridItem}
              onClick={() => handlePostClick(post)}
            >
              <img
                src={getAssetUrl(post.image)}
                alt={post.description}
                className={styles.postImage}
                loading="lazy"
              />
              <div className={styles.overlay}>
                <div className={styles.postInfo}>
                  <div 
                    className={styles.authorInfo}
                    onClick={(e) => handleAuthorClick(e, post.author.username)}
                  >
                    <img
                      src={getAssetUrl(post.author.avatar)}
                      alt={post.author.username}
                      className={styles.authorAvatar}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-avatar.svg';
                      }}
                    />
                    <span className={styles.authorName}>{post.author.username}</span>
                  </div>
                  {post.description && (
                    <p className={styles.postDescription}>
                      {post.description}
                    </p>
                  )}
                  <div className={styles.postStats}>
                    <div className={styles.statItem}>
                      <i className="fas fa-heart"></i>
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <i className="fas fa-comment"></i>
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {posts.length > 0 && <PostsInfo />}
      </div>
    </div>
  );
};

export default Explore; 