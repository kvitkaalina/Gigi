import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MobileNav.module.css';

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={styles.mobileNav}>
      <button
        className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
        onClick={() => navigate('/')}
        aria-label="Home"
      >
        <i className="fas fa-home"></i>
        <span>Home</span>
      </button>
      
      <button
        className={`${styles.navItem} ${isActive('/explore') ? styles.active : ''}`}
        onClick={() => navigate('/explore')}
        aria-label="Explore"
      >
        <i className="fas fa-compass"></i>
        <span>Explore</span>
      </button>
      
      <button
        className={`${styles.navItem} ${isActive('/create') ? styles.active : ''}`}
        onClick={() => navigate('/create')}
        aria-label="Create Post"
      >
        <i className="fas fa-plus-square"></i>
        <span>Create</span>
      </button>
      
      <button
        className={`${styles.navItem} ${isActive('/messages') ? styles.active : ''}`}
        onClick={() => navigate('/messages')}
        aria-label="Messages"
      >
        <i className="far fa-paper-plane"></i>
        <span>Messages</span>
      </button>
      
      <button
        className={`${styles.navItem} ${isActive('/profile') ? styles.active : ''}`}
        onClick={() => {
          const userId = localStorage.getItem('userId');
          const username = localStorage.getItem('username');
          if (username) {
            navigate(`/profile/${username}`);
          }
        }}
        aria-label="Profile"
      >
        <i className="far fa-user"></i>
        <span>Profile</span>
      </button>
    </nav>
  );
};

export default MobileNav; 