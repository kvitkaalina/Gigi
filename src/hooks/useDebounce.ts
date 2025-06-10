import { useState, useEffect } from 'react';

/**
 * Хук для дебаунсинга значения
 * @param value Значение для дебаунсинга
 * @param delay Задержка в миллисекундах
 * @returns Дебаунсированное значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер для обновления значения
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при изменении value или размонтировании
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 