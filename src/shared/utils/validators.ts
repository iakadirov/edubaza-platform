/**
 * Validation Utilities
 * Общие функции валидации
 */

/**
 * Валидация телефонного номера Узбекистана
 * Формат: +998XXXXXXXXX
 */
export function isValidUzbekPhone(phone: string): boolean {
  const phoneRegex = /^\+998[0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Нормализация телефонного номера
 * Приводит к формату +998XXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  // Убираем все нечисловые символы
  let cleaned = phone.replace(/\D/g, '');

  // Если начинается с 998, добавляем +
  if (cleaned.startsWith('998')) {
    return '+' + cleaned;
  }

  // Если начинается с 8, заменяем на +998
  if (cleaned.startsWith('8') && cleaned.length === 10) {
    return '+998' + cleaned.slice(1);
  }

  // Если просто 9 цифр, добавляем +998
  if (cleaned.length === 9) {
    return '+998' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Валидация email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Валидация класса (1-11)
 */
export function isValidGrade(grade: number): boolean {
  return Number.isInteger(grade) && grade >= 1 && grade <= 11;
}

/**
 * Sanitize строку (убрать опасные символы)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Убрать < и >
    .trim();
}

/**
 * Проверка на пустую строку
 */
export function isEmptyString(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Валидация суммы платежа
 */
export function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= 100000000; // max 100 млн
}
