import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services';
import styles from './Register.module.css';

interface RegisterFormData {
  email: string;
  fullName: string;
  username: string;
  password: string;
}

const INITIAL_FORM_STATE: RegisterFormData = {
  email: '',
  fullName: '',
  username: '',
  password: ''
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_STATE);
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

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting to register with:', {
        ...formData,
        password: '***'
      });
      const response = await authService.register(formData);
      console.log('Registration successful:', {
        userId: response._id,
        username: response.username
      });
      
      // Save all necessary user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response._id);
      localStorage.setItem('username', response.username);
      
      // Clear form and redirect
      resetForm();
      
      // Redirect to user's profile
      navigate(`/profile/${response.username}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during registration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['register-container']}>
      <div className={styles['form-container']}>
        <div className={styles['form-box']}>
          <h1 className={styles['instagram-logo']}>GiGi</h1>
          <h2 className={styles.subtitle}>
          Genuine Inspiration, Genuine Images
          </h2>

          {error && <div className={styles['error-message']}>{error}</div>}

          <form 
            onSubmit={handleSubmit} 
            className={styles['register-form']}
            autoComplete="off"
            lang="en"
            noValidate
          >
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={styles['form-input']}
              required
              autoComplete="off"
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Please enter a valid email address"
            />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className={styles['form-input']}
              required
              autoComplete="off"
              minLength={2}
              title="Please enter your full name (minimum 2 characters)"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles['form-input']}
              required
              autoComplete="off"
              minLength={3}
              pattern="^[a-zA-Z0-9._]+$"
              title="Username can only contain letters, numbers, dots and underscores"
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
              minLength={6}
              title="Password must be at least 6 characters long"
            />

            <button
              type="submit"
              disabled={loading}
              className={styles['submit-button']}
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>

            <p className={styles.terms}>
              People who use our service may have uploaded your contact information to GiGi.{' '}
              <Link to="/terms">Learn More</Link>
            </p>
          </form>

          <p className={styles.terms}>
            By signing up, you agree to our{' '}
            <a href="#">Terms</a>,{' '}
            <a href="#">Privacy Policy</a> and{' '}
            <a href="#">Cookies Policy</a>.
          </p>
        </div>

        <div className={styles['login-box']}>
          <p>
            Have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 