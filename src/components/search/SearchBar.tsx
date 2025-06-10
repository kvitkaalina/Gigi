import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import styles from './SearchBar.module.css';
import defaultAvatar from '../../assets/default-avatar.svg';
import { getAssetUrl } from '../../utils/urls';
import { searchService } from '../../services';
import type { SearchUser } from '../../services/searchService';

interface SearchBarProps {
  onUserSelect?: (user: SearchUser) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchTerm.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const users = await searchService.searchUsers(debouncedSearchTerm);
        setResults(users);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      setIsOpen(false);
    }
  };

  const handleUserClick = (user: SearchUser) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={styles.searchContainer} ref={wrapperRef}>
      <div className={styles.searchInputWrapper}>
        <i className={`fas fa-search ${styles.searchIcon}`}></i>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          placeholder="Search by username..."
          className={styles.searchInput}
        />
        {isLoading && <div className={styles.loader} />}
      </div>

      {isOpen && (
        <div className={styles.resultsContainer}>
          {results.length > 0 ? (
            results.map((user) => (
              <div
                key={user._id}
                className={styles.resultItem}
                onClick={() => handleUserClick(user)}
              >
                <img
                  src={user.avatar ? getAssetUrl(user.avatar) : defaultAvatar}
                  alt={user.username}
                  className={styles.userAvatar}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.username}</div>
                  {user.bio && <div className={styles.userEmail}>{user.bio}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 