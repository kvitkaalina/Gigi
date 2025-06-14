import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import EditProfileModal from '../components/profile/EditProfileModal';
import DeletePostModal from '../components/profile/DeletePostModal';
import FollowList from '../components/profile/FollowList';
import PostModal from '../components/post/PostModal';
import PostsInfo from '../components/feed/PostsInfo';
import styles from './Profile.module.css';
import { userService, postService } from '../services';
import type { User, FollowUser } from '../services/userService';
import type { Post, Comment } from '../services/postService';

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onLikeUpdate?: (postId: string, hasLiked: boolean, likesCount: number) => void;
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const currentUserId = localStorage.getItem('userId');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [showUnfollowDropdown, setShowUnfollowDropdown] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const defaultAvatar = '/images/my-avatar-placeholder.png';

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [username]);

  const checkFollowStatus = async (userId: string) => {
    try {
      const { following } = await userService.checkFollowStatus(userId);
      setIsFollowing(following);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await userService.getProfile(username!);
      setUser(data);
      // Проверяем статус подписки после получения данных профиля
      if (data._id && currentUserId !== data._id) {
        await checkFollowStatus(data._id);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const data = await postService.getUserPosts(username!);
      console.log('Fetched posts:', data);
      setPosts(data || []);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowers = async (userId: string) => {
    try {
      const data = await userService.getFollowers(userId);
      setFollowers(data);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };

  const fetchFollowing = async (userId: string) => {
    try {
      const data = await userService.getFollowing(userId);
      setFollowing(data);
    } catch (err) {
      console.error('Error fetching following:', err);
    }
  };

  const handleFollowersClick = async () => {
    if (user && user.followers.length > 0) {
      await fetchFollowers(user._id);
      setShowFollowers(true);
    }
  };

  const handleFollowingClick = async () => {
    if (user && user.following.length > 0) {
      await fetchFollowing(user._id);
      setShowFollowing(true);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (5MB максимум)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('http://localhost:5001/api/users/profile/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }
      
      const data = await response.json();
      setUser(prev => prev ? { ...prev, avatar: data.avatar } : null);
    } catch (err) {
      console.error('Error updating avatar:', err);
      alert('Failed to update avatar. Please try again.');
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    try {
      await userService.toggleFollow(user._id, isFollowing);
      setIsFollowing(!isFollowing);
      // Обновляем количество подписчиков
      setUser((prev: User | null) => prev ? {
        ...prev,
        followers: isFollowing 
          ? prev.followers.filter(id => id !== currentUserId)
          : [...prev.followers, currentUserId!]
      } : null);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleDeleteClick = (post: Post, event: React.MouseEvent) => {
    event.stopPropagation();
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post._id !== postToDelete._id));
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleLikeUpdate = (postId: string, hasLiked: boolean, likesCount: number) => {
    // Обновляем список постов
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: Array(likesCount).fill(''),
            isLiked: hasLiked
          };
        }
        return post;
      })
    );

    // Обновляем выбранный пост, если он открыт
    setSelectedPost(prev => {
      if (prev && prev._id === postId) {
        return {
          ...prev,
          likes: Array(likesCount).fill(''),
          isLiked: hasLiked
        };
      }
      return prev;
    });
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!user) return <div className={styles.error}>User not found</div>;

  const isOwnProfile = user._id === currentUserId;

  return (
    <div className={styles.profilePage}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <img 
                src={user.avatar ? `http://localhost:5001${user.avatar}` : defaultAvatar} 
                alt={user.username} 
                className={styles.avatar}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAvatar;
                }}
              />
              {isOwnProfile && (
                <label className={styles.changeAvatarButton}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  Change Photo
                </label>
              )}
            </div>
          </div>
          
          <div className={styles.profileInfo}>
            <div className={styles.profileActions}>
              <h1 className={styles.username}>{user.username}</h1>
              {isOwnProfile ? (
                <button 
                  className={styles.editButton}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
                  onClick={handleFollow}
                >
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              )}
            </div>

            <div className={styles.stats}>
              <span><strong>{posts?.length || 0}</strong> posts</span>
              <button 
                className={styles.statButton} 
                onClick={handleFollowersClick}
                disabled={!user?.followers?.length}
              >
                <strong>{user?.followers?.length || 0}</strong> followers
              </button>
              <button 
                className={styles.statButton} 
                onClick={handleFollowingClick}
                disabled={!user?.following?.length}
              >
                <strong>{user?.following?.length || 0}</strong> following
              </button>
            </div>

            <div className={styles.bioSection}>
              <h2 className={styles.fullName}>{user.fullName || ''}</h2>
              <p className={styles.bio}>{user.bio || ''}</p>
            </div>
          </div>
        </div>

        <div className={styles.postsGrid}>
          {(posts || []).map(post => (
            <div 
              key={post._id} 
              className={styles.postItem}
              onClick={() => handlePostClick(post)}
            >
              <img 
                src={`http://localhost:5001${post.image}`} 
                alt="Post"
              />
              <div className={styles.postOverlay}>
                <div className={styles.postStats}>
                  <span>
                    <i className="fas fa-heart"></i> {post.likes?.length || 0}
                  </span>
                  <span>
                    <i className="fas fa-comment"></i> {post.comments?.length || 0}
                  </span>
                </div>
                {isOwnProfile && (
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteClick(post, e)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {posts.length > 0 && <PostsInfo />}

        {showEditModal && user && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEditModal(false)}
            onUpdate={(updatedUser) => {
              setUser(updatedUser);
              setShowEditModal(false);
            }}
          />
        )}

        {showDeleteModal && (
          <DeletePostModal
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}

        {showFollowers && (
          <FollowList
            users={followers}
            title="Followers"
            onClose={() => setShowFollowers(false)}
          />
        )}

        {showFollowing && (
          <FollowList
            users={following}
            title="Following"
            onClose={() => setShowFollowing(false)}
          />
        )}

        {showPostModal && selectedPost && (
          <PostModal
            post={selectedPost}
            onClose={() => {
              setShowPostModal(false);
              setSelectedPost(null);
            }}
            onLikeUpdate={handleLikeUpdate}
          />
        )}
      </main>
    </div>
  );
};

export default Profile; 