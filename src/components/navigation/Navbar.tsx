import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import styles from './Navbar.module.css';
import type { SearchUser } from '../../services/searchService';
import AuthService from '../../utils/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(AuthService.isAdmin());
  }, []);

  const handleLogout = () => {
    AuthService.logout();
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
            {isAdmin && (
              <Link to="/admin" className={styles.navItem}>
                <i className="fas fa-user-shield"></i>
              </Link>
            )}
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