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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${apiUrl}${url}`;
}
