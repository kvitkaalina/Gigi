import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../config';
import AuthService from '../../utils/auth';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        `/auth/reset-password/${token}`,
        { password }
      );
      
      // Если сервер вернул токен и данные пользователя, сохраняем их
      if (response.data.token) {
        AuthService.setUserData({
          token: response.data.token,
          userId: response.data._id,
          username: response.data.username
        });
        
        // Перенаправляем на профиль
        navigate(`/profile/${response.data.username}`);
      } else {
        // Если токен не получен, перенаправляем на страницу входа
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h3 className={styles.title}>Reset Your Password</h3>
        <p className={styles.description}>
          Please enter your new password below.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className={styles.input}
            required
            minLength={6}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className={styles.input}
            required
            minLength={6}
          />

          <button 
            type="submit" 
            className={styles.resetButton}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 