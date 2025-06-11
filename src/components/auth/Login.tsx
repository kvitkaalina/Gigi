import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services';
import AuthService from '../../utils/auth';
import styles from './Login.module.css';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation
    if (!formData.email.trim()) {
      setError('Please enter your username or email');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting login form with:', { ...formData, password: '***' });
      const response = await authService.login(formData);
      console.log('Login successful:', { userId: response._id, username: response.username });

      // Сохраняем данные пользователя через AuthService
      AuthService.setUserData({
        token: response.token,
        userId: response._id,
        username: response.username,
        role: response.role
      });

      // Редирект на профиль пользователя
      if (response.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['phones-container']}>
        <img 
          src="/images/gigi.png" 
          alt="GiGi preview" 
          className={styles['preview-image']}
        />
      </div>

      <div className={styles['form-container']}>
        <div className={styles['form-box']}>
          <h1 className={styles['instagram-logo']}>GiGi</h1>

          {error && <div className={styles['error-message']}>{error}</div>}

          <form 
            onSubmit={handleSubmit} 
            className={styles['login-form']}
            autoComplete="off"
            lang="en"
            noValidate
          >
            <input
              type="text"
              name="email"
              placeholder="Username or email"
              value={formData.email}
              onChange={handleChange}
              className={styles['form-input']}
              required
              autoComplete="off"
              title="Please enter your username or email"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles['form-input']}
              required
              autoComplete="new-password"
              title="Please enter your password"
            />

            <button 
              type="submit" 
              disabled={loading}
              className={styles['submit-button']}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles['divider-text']}>OR</span>
          </div>

          <div className={styles['forgot-password']}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>

        <div className={styles['signup-box']}>
          <p>
            Don't have an account?{' '}
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 