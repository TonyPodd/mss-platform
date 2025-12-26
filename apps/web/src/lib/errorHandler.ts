import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  field?: string;
}

/**
 * Извлекает понятное сообщение об ошибке из ответа API
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data;

    // Проверяем структуру ошибки от NestJS
    if (apiError) {
      // Одно сообщение
      if (typeof apiError.message === 'string') {
        return apiError.message;
      }

      // Массив сообщений (валидация)
      if (Array.isArray(apiError.message) && apiError.message.length > 0) {
        return apiError.message.join(', ');
      }

      // Fallback на error
      if (typeof apiError.error === 'string') {
        return apiError.error;
      }
    }

    // HTTP статус коды
    switch (error.response?.status) {
      case 400:
        return 'Неверные данные запроса';
      case 401:
        return 'Необходимо войти в систему';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 409:
        return 'Конфликт данных';
      case 422:
        return 'Ошибка валидации данных';
      case 429:
        return 'Слишком много запросов, попробуйте позже';
      case 500:
        return 'Ошибка сервера';
      case 503:
        return 'Сервис временно недоступен';
    }

    // Ошибки сети
    if (error.code === 'ERR_NETWORK') {
      return 'Ошибка соединения с сервером';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Время ожидания истекло';
    }
  }

  // Generic ошибка
  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
}

/**
 * Определяет тип ошибки для отображения соответствующего toast
 */
export function getErrorType(error: unknown): 'error' | 'warning' {
  if (error instanceof AxiosError) {
    const status = error.response?.status;

    // Предупреждения для клиентских ошибок
    if (status && status >= 400 && status < 500) {
      return 'warning';
    }
  }

  return 'error';
}

/**
 * Форматирует ошибку для логирования
 */
export function formatErrorForLog(error: unknown): string {
  if (error instanceof AxiosError) {
    return `API Error: ${error.response?.status || 'Unknown'} - ${error.config?.url} - ${getErrorMessage(error)}`;
  }

  if (error instanceof Error) {
    return `Error: ${error.name} - ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}
