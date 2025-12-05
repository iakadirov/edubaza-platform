/**
 * Утилиты для работы с телефонными номерами Узбекистана
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Форматирует телефонный номер в стандартный формат +998XXXXXXXXX
 * @param phone - входной номер телефона
 * @returns результат валидации и отформатированный номер
 */
export function formatUzbekPhone(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: 'Номер телефона обязателен',
    };
  }

  // Убираем все пробелы и нечисловые символы кроме +
  let formatted = phone.trim().replace(/[^\d+]/g, '');

  // Добавляем +998 если номер начинается без кода страны
  if (formatted.match(/^9\d{8}$/)) {
    // Номер вида: 946392125
    formatted = `+998${formatted}`;
  } else if (formatted.match(/^998\d{9}$/)) {
    // Номер вида: 998946392125
    formatted = `+${formatted}`;
  } else if (!formatted.startsWith('+998')) {
    // Пытаемся добавить +998 к любому другому формату
    formatted = `+998${formatted.replace(/^\+/, '')}`;
  }

  // Проверяем финальный формат: +998XXXXXXXXX (ровно 13 символов)
  if (!formatted.match(/^\+998\d{9}$/)) {
    return {
      isValid: false,
      formatted: '',
      error: 'Неверный формат номера телефона. Введите 9 цифр (например: 946392125)',
    };
  }

  return {
    isValid: true,
    formatted,
  };
}

/**
 * Быстрая проверка валидности узбекского номера
 * @param phone - номер телефона для проверки
 * @returns true если номер валиден
 */
export function isValidUzbekPhone(phone: string): boolean {
  return formatUzbekPhone(phone).isValid;
}

/**
 * Маскирует номер телефона для отображения: +998 94 639 **25
 * @param phone - отформатированный номер телефона
 * @returns замаскированный номер
 */
export function maskPhone(phone: string): string {
  if (!phone || !phone.match(/^\+998\d{9}$/)) {
    return phone;
  }

  // +998946392125 -> +998 94 639 **25
  return `${phone.substring(0, 4)} ${phone.substring(4, 6)} ${phone.substring(6, 9)} **${phone.substring(11)}`;
}

/**
 * Извлекает последние 4 цифры номера
 * @param phone - номер телефона
 * @returns последние 4 цифры
 */
export function getPhoneLast4Digits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-4);
}
