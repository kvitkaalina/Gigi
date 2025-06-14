/**
 * Утилиты для работы с URL в приложении
 */

export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const apiBase = process.env.REACT_APP_API_BASE || '/api';
  return `${baseUrl}${apiBase}${path}`;
};

export const getAssetUrl = (path: string | undefined | null): string => {
  if (!path || path === 'default-avatar.jpg' || !path.startsWith('/uploads/')) {
    return '/images/my-avatar-placeholder.png';
  }
  const baseUrl = process.env.REACT_APP_ASSETS_URL || 'http://localhost:5001';
  return `${baseUrl}${path}`;
}; 