/**
 * Преобразует относительный URL изображения в полный URL с API сервером
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // Если URL уже полный (начинается с http), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Если относительный путь, добавляем базовый URL API
  // Используем window.location для определения текущего хоста, но API всегда на порту 3000
  const apiUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://localhost:3000';

  return `${apiUrl}${url}`;
}
