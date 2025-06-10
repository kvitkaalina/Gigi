import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Проверяем валидность токена через API
        const response = await fetch('http://localhost:5001/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Если токен невалидный, удаляем его и все данные пользователя
          localStorage.clear(); // Очищаем все данные
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.clear(); // Очищаем все данные при ошибке
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Перепроверяем при изменении пути

  // Немедленно проверяем наличие токена
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  // Показываем загрузку только если есть токен и проверка не завершена
  if (isAuthenticated === null && localStorage.getItem('token')) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 