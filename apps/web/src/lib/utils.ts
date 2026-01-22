/**
 * Преобразует относительный URL изображения в полный URL
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://universnazare.ru';

  const normalizePath = (path: string) => {
    // API иногда возвращает /api/uploads/... — приводим к /uploads/...
    if (path.startsWith('/api/uploads')) return path.replace('/api/uploads', '/uploads');
    return path;
  };

 // Полный URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      const hostIsLocal = ['localhost', '127.0.0.1'].includes(parsed.hostname);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
      const isApiHost = apiUrl && parsed.origin === apiUrl;
      const normalized = normalizePath(parsed.pathname + parsed.search);

      if (hostIsLocal || isApiHost) {
        return origin + encodeURI(normalized);
      }

      // Если внешний хост — возвращаем как есть, но нормализуем /api/uploads
      return parsed.origin + encodeURI(normalized);
    } catch (e) {
      // если вдруг URL не разобрался, падаем в относительный кейс ниже
    }
  }

  // Относительный путь
  const path = url.startsWith('/') ? url : `/${url}`;
  return origin + encodeURI(normalizePath(path));
}
