import React from 'react';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageWrapper}>
          <img 
            src="/images/gigi.png"
            alt="GiGi 404" 
            className={styles.image}
          />
        </div>
        <h1 className={styles.title}>
          Oops! Page Not Found (404 Error)
        </h1>
        <p className={styles.description}>
          We're sorry, but the page you're looking for doesn't seem to exist.
          You might have clicked an outdated link or entered an incorrect address.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className={styles.button}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound; 