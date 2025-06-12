import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, Notification } from '../../services/notificationService';
import { API_BASE_URL } from '../../services/config';
import { getAssetUrl } from '../../utils/urls';
import styles from './NotificationList.module.css';
import defaultAvatar from '../../assets/default-avatar.svg';
import { formatDistanceToNow } from 'date-fns';

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      const data = await notificationService.getNotifications();
      console.log('Received notifications:', data);
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      console.error('Error fetching notifications:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
      console.log('Successfully marked notification as read');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error marking notification as read';
      console.error(errorMessage, err);
      setError(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      console.log('Successfully marked all notifications as read');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error marking all notifications as read';
      console.error(errorMessage, err);
      setError(errorMessage);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      console.log('Deleting notification:', notificationId);
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      console.log('Successfully deleted notification');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting notification';
      console.error(errorMessage, err);
      setError(errorMessage);
    }
  };

  const handleDeleteAll = async () => {
    try {
      console.log('Deleting all notifications');
      const notificationIds = notifications.map(notif => notif._id);
      await notificationService.deleteAllNotifications(notificationIds);
      setNotifications([]);
      console.log('Successfully deleted all notifications');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting all notifications';
      console.error(errorMessage, err);
      setError(errorMessage);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('Notification clicked:', {
      type: notification.type,
      target: notification.target,
      actor: notification.actor
    });

    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    setTimeout(() => {
      if ((notification.type === 'like' || notification.type === 'comment') && notification.target?._id) {
        console.log('Navigating to post:', notification.target._id);
        navigate(`/post/${notification.target._id}`);
      } else if (notification.type === 'follow' && notification.actor?.username) {
        console.log('Navigating to profile:', notification.actor.username);
        navigate(`/profile/${notification.actor.username}`);
      } else {
        console.warn('Missing required data for navigation:', { notification });
      }
    }, 100);
  };

  const getNotificationText = (notification: Notification): string => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      default:
        return '';
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  if (loading) {
    return <div className={styles.loading}>Loading notifications...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.header}>
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <div className={styles.actionButtons}>
            <button 
              className={styles.markAllButton}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
            <button 
              className={styles.deleteAllButton}
              onClick={handleDeleteAll}
            >
              Delete all
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className={styles.notificationList}>
          {notifications.map(notification => (
            <div 
              key={notification._id}
              className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={styles.notificationContent}>
                <img 
                  src={notification.actor?.avatar ? getAssetUrl(notification.actor.avatar) : defaultAvatar}
                  alt={notification.actor?.fullName || notification.actor?.username || 'User'}
                  className={styles.avatar}
                  onError={(e) => {
                    console.error('Failed to load actor avatar');
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
                <div className={styles.notificationText}>
                  <span className={styles.username}>
                    {notification.actor?.fullName || notification.actor?.username || 'Unknown user'}
                  </span>
                  <span>{getNotificationText(notification)}</span>
                  <span className={styles.time}>
                    {formatNotificationTime(notification.createdAt)}
                    {!notification.isRead && <span className={styles.newLabel}>New</span>}
                  </span>
                </div>
              </div>
              {notification.type !== 'follow' && notification.target?.image && (
                <div className={styles.imageContainer}>
                  <img 
                    src={getAssetUrl(notification.target.image)}
                    alt={notification.target?.description || "Post thumbnail"}
                    className={styles.postThumbnail}
                    onError={(e) => {
                      console.error('Failed to load notification image');
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              {notification.type === 'follow' && (
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification._id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 