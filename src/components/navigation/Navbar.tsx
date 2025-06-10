import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import styles from './Navbar.module.css';
import type { SearchUser } from '../../services/searchService';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    // Очищаем все данные пользователя
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    // Перенаправляем на страницу логина
    navigate('/login');
  };

  const handleUserSelect = (user: SearchUser) => {
    navigate(`/profile/${user.username}`);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    console.log('Toggle search clicked, current state:', !isSearchOpen);
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            GiGi
          </Link>
          
          <div className={styles.navItems}>
            <Link to="/" className={styles.navItem}>
              <i className="fas fa-home"></i>
            </Link>
            <button onClick={toggleSearch} className={styles.navItem}>
              <i className="fas fa-search"></i>
            </button>
            <Link to="/explore" className={styles.navItem}>
              <i className="fas fa-compass"></i>
            </Link>
            <Link to="/create" className={styles.navItem}>
              <i className="fas fa-plus-square"></i>
            </Link>
            <Link to="/profile" className={styles.navItem}>
              <i className="fas fa-user"></i>
            </Link>
            <button onClick={handleLogout} className={styles.navItem}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      {isSearchOpen && (
        <div className={styles.searchModal}>
          <div className={styles.searchModalContent}>
            <div className={styles.searchModalHeader}>
              <h2>Search</h2>
              <button onClick={toggleSearch} className={styles.closeButton}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <SearchBar onUserSelect={handleUserSelect} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 