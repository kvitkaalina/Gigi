import React from 'react';
import styles from './PostsInfo.module.css';

const PostsInfo: React.FC = () => {
  return (
    <div className={styles.postsInfo}>
      <div className={styles.navigation}>
        <a href="/" className={styles.navLink}>Home</a>
        <a href="/search" className={styles.navLink}>Search</a>
        <a href="/explore" className={styles.navLink}>Explore</a>
        <a href="/messages" className={styles.navLink}>Messages</a>
        <a href="/notifications" className={styles.navLink}>Notifications</a>
        <a href="/create" className={styles.navLink}>Create</a>
      </div>
      <div className={styles.copyright}>© 2024 GiGi</div>
    </div>
  );
};

export default PostsInfo; 