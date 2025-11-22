/**
 * Форматирует дату в читаемый формат для отображения
 * @param dateString - ISO строка даты или Date объект
 * @param includeTime - включить время в формат
 * @returns отформатированная строка даты
 */
export function formatDate(dateString: string | Date | null | undefined, includeTime = false): string {
  if (!dateString) return '-';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return '-';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Форматирует дату в относительный формат (например, "2 дня назад")
 */
export function formatRelativeDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? 'год' : diffYears < 5 ? 'года' : 'лет'} назад`;
    }
    if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'месяц' : diffMonths < 5 ? 'месяца' : 'месяцев'} назад`;
    }
    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
    }
    if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    }
    if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'минуту' : diffMinutes < 5 ? 'минуты' : 'минут'} назад`;
    }

    return 'только что';
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '-';
  }
}
