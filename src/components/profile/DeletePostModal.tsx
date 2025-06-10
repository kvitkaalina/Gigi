import React from 'react';
import styles from './DeletePostModal.module.css';

interface DeletePostModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Delete Post?</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.button} ${styles.deleteButton}`}
            onClick={onConfirm}
          >
            Delete
          </button>
          <button 
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePostModal; 