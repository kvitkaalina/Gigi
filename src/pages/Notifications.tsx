import React from 'react';
import NotificationList from '../components/notifications/NotificationList';
import Sidebar from '../components/navigation/Sidebar';
import MobileNav from '../components/navigation/MobileNav';
import PostsInfo from '../components/feed/PostsInfo';
import styles from './Notifications.module.css';

const Notifications: React.FC = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>
      <MobileNav />
      <div className={styles.mainContent}>
        <div className={styles.notificationsWrapper}>
          <NotificationList />
        </div>
        <div className={styles.postsInfoWrapper}>
          <PostsInfo />
        </div>
      </div>
    </div>
  );
};

export default Notifications; 