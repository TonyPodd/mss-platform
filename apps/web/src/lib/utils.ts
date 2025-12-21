/**
 * Преобразует относительный URL изображения в полный URL
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // Если URL уже полный (начинается с http), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Если относительный путь, используем текущий хост
  // NGINX проксирует /uploads на API сервер
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:3000';

  return `${baseUrl}${url}`;
}
