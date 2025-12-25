/**
 * Преобразует относительный URL изображения в полный URL
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // Если URL уже полный (начинается с http), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Если относительный путь, возвращаем как есть
  // Браузер автоматически преобразует его относительно текущего хоста
  // NGINX проксирует /uploads на API сервер
  return url;
}
