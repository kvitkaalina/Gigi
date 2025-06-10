import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FollowList.module.css';
import defaultAvatar from '../../assets/default-avatar.svg';

interface User {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

interface FollowListProps {
  users: User[];
  title: string;
  onClose: () => void;
}

const FollowList: React.FC<FollowListProps> = ({ users, title, onClose }) => {
  const navigate = useNavigate();

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={styles.list}>
          {users.length === 0 ? (
            <p className={styles.noUsers}>No users to display</p>
          ) : (
            users.map(user => (
              <div 
                key={user._id} 
                className={styles.userItem}
                onClick={() => handleUserClick(user.username)}
              >
                <img 
                  src={user.avatar ? `http://localhost:5001${user.avatar}` : defaultAvatar}
                  alt={user.username}
                  className={styles.avatar}
                />
                <div className={styles.userInfo}>
                  <span className={styles.username}>{user.username}</span>
                  {user.bio && <p className={styles.bio}>{user.bio}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowList; 