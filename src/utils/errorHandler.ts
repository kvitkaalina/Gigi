import { NavigateFunction } from 'react-router-dom';

interface ErrorHandlerOptions {
  navigate?: NavigateFunction;
  setError?: (error: string) => void;
  showToast?: (message: string) => void;
}

export const handleApiError = (error: any, options: ErrorHandlerOptions = {}) => {
  const { navigate, setError, showToast } = options;

  // Обработка ошибок аутентификации
  if (error.response?.status === 401) {
    localStorage.clear();
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
    return;
  }

  // Получаем текст ошибки
  const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

  // Логируем ошибку
  console.error('API Error:', {
    message: errorMessage,
    status: error.response?.status,
    endpoint: error.config?.url,
    method: error.config?.method,
  });

  // Показываем ошибку пользователю
  if (setError) {
    setError(errorMessage);
  }
  if (showToast) {
    showToast(errorMessage);
  }

  return errorMessage;
};

export const handleSocketError = (error: any, options: ErrorHandlerOptions = {}) => {
  const { navigate, setError, showToast } = options;

  // Обработка ошибок сокета
  const errorMessage = error.message || 'Socket connection error';

  console.error('Socket Error:', {
    message: errorMessage,
    type: error.type,
    data: error.data,
  });

  if (setError) {
    setError(errorMessage);
  }
  if (showToast) {
    showToast(errorMessage);
  }

  return errorMessage;
};

export const handleValidationError = (error: any, options: ErrorHandlerOptions = {}) => {
  const { setError, showToast } = options;

  const errorMessage = error.message || 'Validation error';

  if (setError) {
    setError(errorMessage);
  }
  if (showToast) {
    showToast(errorMessage);
  }

  return errorMessage;
}; 