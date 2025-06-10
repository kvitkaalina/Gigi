import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ForgotPassword.module.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
      alert('Password reset link has been sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <div className={styles.lockIconContainer}>
          <div className={styles.lockIcon}>
            <i className="fas fa-lock"></i>
          </div>
        </div>

        <h3 className={styles.title}>Trouble logging in?</h3>
        <p className={styles.description}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} lang="en" noValidate>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Email"
            className={styles.input}
            required
            title="Please enter your email"
          />

          <button 
            type="submit"
            className={styles.resetButton}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Reset your password'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <Link to="/register" className={styles.createAccount}>
          Create new account
        </Link>

        <div className={styles.backToLogin}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 