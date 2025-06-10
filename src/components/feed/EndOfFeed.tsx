import React from 'react';
import styles from './EndOfFeed.module.css';

const EndOfFeed: React.FC = () => {
  return (
    <div className={styles.endOfFeed}>
      <div className={styles.checkmarkContainer}>
        <svg className={styles.checkmark} viewBox="0 0 24 24">
          <circle className={styles.checkmarkCircle} cx="12" cy="12" r="11" />
          <path className={styles.checkmarkPath} d="M7 13l3 3 7-7" />
        </svg>
      </div>
      <h4 className={styles.title}>You've seen all the updates</h4>
      <p className={styles.subtitle}>You have viewed all new publications.</p>
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

export default EndOfFeed; 