/**
 * Валидация телефонного номера
 * Поддерживает форматы:
 * - +7 (999) 123-45-67
 * - +79991234567
 * - 89991234567
 * - 79991234567
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;

  // Удаляем все символы кроме цифр и +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Проверяем различные форматы российских номеров
  const patterns = [
    /^\+7\d{10}$/,  // +7XXXXXXXXXX
    /^7\d{10}$/,    // 7XXXXXXXXXX
    /^8\d{10}$/,    // 8XXXXXXXXXX
  ];

  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Форматирование телефонного номера в стандартный вид
 * Пример: +7 (999) 123-45-67
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Если начинается с 8, меняем на +7
  let formatted = cleaned.startsWith('8') ? '+7' + cleaned.slice(1) : cleaned;

  // Если начинается с 7, добавляем +
  if (formatted.startsWith('7') && !formatted.startsWith('+7')) {
    formatted = '+' + formatted;
  }

  // Если не начинается с +7, добавляем
  if (!formatted.startsWith('+7')) {
    formatted = '+7' + formatted;
  }

  // Форматируем: +7 (XXX) XXX-XX-XX
  const match = formatted.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }

  return phone;
}

/**
 * Получение сообщения об ошибке валидации телефона
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone) {
    return 'Телефон обязателен для заполнения';
  }

  if (!validatePhone(phone)) {
    return 'Введите корректный номер телефона (например, +7 999 123-45-67)';
  }

  return null;
}

/**
 * Валидация email адреса
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;

  // Простая регулярка для email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}
