interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private static readonly CACHE_PREFIX = 'app_cache_';
  private static readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 минут

  // Сохранить данные в кэш
  static set<T>(key: string, data: T, expiryMs: number = this.DEFAULT_EXPIRY): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now() + expiryMs
    };
    localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(item));
  }

  // Получить данные из кэша
  static get<T>(key: string): T | null {
    const item = localStorage.getItem(this.CACHE_PREFIX + key);
    if (!item) return null;

    const cacheItem: CacheItem<T> = JSON.parse(item);
    if (Date.now() > cacheItem.timestamp) {
      this.remove(key);
      return null;
    }

    return cacheItem.data;
  }

  // Удалить данные из кэша
  static remove(key: string): void {
    localStorage.removeItem(this.CACHE_PREFIX + key);
  }

  // Очистить весь кэш
  static clear(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Очистить просроченные данные
  static clearExpired(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          const cacheItem: CacheItem<any> = JSON.parse(item);
          if (Date.now() > cacheItem.timestamp) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  }

  // Проверить наличие данных в кэше
  static has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export default CacheService; 