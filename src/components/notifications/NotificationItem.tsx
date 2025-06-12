import React from 'react';
import { usePostModalContext } from '../post/PostModalProvider';
import { postService } from '../../services';
import defaultAvatar from '../../assets/default-avatar.svg';
import { API_BASE_URL } from '../../services/config';
import styles from './NotificationItem.module.css';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: 'like' | 'comment';
    post: string;
    user: {
      _id: string;
      username: string;
      avatar?: string;
    };
    comment?: {
      _id: string;
      text: string;
    };
    createdAt: string;
    read: boolean;
  };
  onRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  const { openPostModal } = usePostModalContext();

  const handleClick = async () => {
    try {
      // Получаем полные данные поста
      const post = await postService.getPostById(notification.post);
      
      // Открываем модальное окно с разными опциями в зависимости от типа уведомления
      openPostModal(post, {
        focusCommentId: notification.type === 'comment' ? notification.comment?._id : undefined,
        scrollToComments: notification.type === 'comment'
      });

      // Помечаем уведомление как прочитанное
      onRead(notification._id);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  return (
    <div 
      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
      onClick={handleClick}
    >
      <img
        src={notification.user.avatar ? `${API_BASE_URL}${notification.user.avatar}` : defaultAvatar}
        alt={notification.user.username}
        className={styles.avatar}
      />
      <div className={styles.content}>
        <span className={styles.username}>{notification.user.username}</span>
        {notification.type === 'like' ? (
          <span>liked your post</span>
        ) : (
          <span>commented: {notification.comment?.text}</span>
        )}
        <span className={styles.time}>
          {new Date(notification.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default NotificationItem; 