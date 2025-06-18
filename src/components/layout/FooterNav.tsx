import React from 'react';
import styles from './FooterNav.module.css';

const FooterNav: React.FC = () => {
  return (
    <footer className={styles.footerNav}>
      <div className={styles.copyright}>
        © 2024 GiGi
      </div>
    </footer>
  );
};

export default FooterNav; 