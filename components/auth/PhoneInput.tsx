import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export default function PhoneInput({
  value,
  onChange,
  label = 'Telefon raqami',
  required = true,
  error,
  placeholder = '__ ___ __ __',
}: PhoneInputProps) {
  // Форматирует только локальную часть (9 цифр после +998)
  const formatLocalNumber = (input: string) => {
    // Убираем все кроме цифр
    const numbers = input.replace(/\D/g, '');

    // Берем максимум 9 цифр
    const localNumber = numbers.substring(0, 9);

    // Форматируем: 94 639 21 25
    const match = localNumber.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (match) {
      const parts = [match[1], match[2], match[3], match[4]].filter(Boolean);
      return parts.join(' ');
    }

    return localNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Получаем только ту часть которую ввёл пользователь (после +998 )
    const input = e.target.value.replace('+998 ', '');
    const formatted = formatLocalNumber(input);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Предотвращаем удаление префикса +998
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;

    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 5) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Не даём курсору заходить на префикс +998
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;

    if (cursorPosition < 5) {
      setTimeout(() => {
        input.setSelectionRange(5, 5);
      }, 0);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="tel"
        value={`+998 ${value}`}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        placeholder={`+998 ${placeholder}`}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Masalan: +998 94 639 21 25
      </p>
    </div>
  );
}
