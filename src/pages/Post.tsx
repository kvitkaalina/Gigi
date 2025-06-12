import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services';
import Sidebar from '../components/navigation/Sidebar';
import PostsInfo from '../components/feed/PostsInfo';
import styles from './Post.module.css';
import type { Post as PostType } from '../services/postService';
import { usePostModalContext } from '../components/post/PostModalProvider';

const Post: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openPostModal } = usePostModalContext();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) return;
        const fetchedPost = await postService.getPostById(id);
        setPost(fetchedPost);
        // Открываем модальное окно сразу после загрузки поста
        openPostModal(fetchedPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, openPostModal]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error || !post) {
    return <div className={styles.error}>{error || 'Post not found'}</div>;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.postsInfoWrapper}>
          <PostsInfo />
        </div>
      </div>
    </div>
  );
};

export default Post; 