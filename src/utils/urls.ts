/**
 * Утилиты для работы с URL в приложении
 */

export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const apiBase = process.env.REACT_APP_API_BASE || '/api';
  return `${baseUrl}${apiBase}${path}`;
};

export const getAssetUrl = (path: string | undefined | null): string => {
  if (!path) return '/default-avatar.svg';
  const baseUrl = process.env.REACT_APP_ASSETS_URL || 'http://localhost:5001';
  // Убираем дублирование /uploads в пути
  const cleanPath = path.startsWith('/uploads/') ? path : `/uploads${path}`;
  return `${baseUrl}${cleanPath}`;
}; 