import { useToast } from '../contexts/ToastContext';
import { getErrorMessage, getErrorType, formatErrorForLog } from '../lib/errorHandler';

/**
 * Хук для удобной обработки ошибок с автоматическим отображением toast
 */
export function useErrorHandler() {
  const { addToast } = useToast();

  /**
   * Обрабатывает ошибку и показывает toast уведомление
   * @param error - Ошибка для обработки
   * @param context - Контекст ошибки для более понятного сообщения
   * @param showToast - Показывать ли toast (по умолчанию true)
   */
  const handleError = (
    error: unknown,
    context?: string,
    showToast = true
  ): string => {
    const message = getErrorMessage(error);
    const type = getErrorType(error);

    // Логируем ошибку в консоль для отладки
    console.error(formatErrorForLog(error), error);

    // Показываем toast если нужно
    if (showToast) {
      const toastMessage = context ? `${context}: ${message}` : message;
      addToast(toastMessage, type);
    }

    return message;
  };

  /**
   * Обертка для async функций с автоматической обработкой ошибок
   * @param fn - Async функция для выполнения
   * @param context - Контекст для сообщения об ошибке
   * @returns Promise с результатом или null при ошибке
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };

  return {
    handleError,
    withErrorHandling,
  };
}
