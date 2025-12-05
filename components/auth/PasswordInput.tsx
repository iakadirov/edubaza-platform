'use client';

import React, { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrength?: boolean;
  required?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  label = 'Parol',
  placeholder = 'Parolni kiriting',
  showStrength = true,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Оценка силы пароля
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (password.length === 0) {
      return { score: 0, label: '', color: 'bg-gray-200' };
    }

    let score = 0;

    // Длина
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Содержит цифры
    if (/\d/.test(password)) score += 1;

    // Содержит заглавные буквы
    if (/[A-ZА-Я]/.test(password)) score += 1;

    // Содержит спецсимволы
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    const maxScore = 6;
    const percentage = (score / maxScore) * 100;

    if (percentage < 33) {
      return { score: percentage, label: 'Zaif', color: 'bg-red-500' };
    } else if (percentage < 66) {
      return { score: percentage, label: 'Oʻrtacha', color: 'bg-yellow-500' };
    } else {
      return { score: percentage, label: 'Ishonchli', color: 'bg-green-500' };
    }
  };

  const strength = getPasswordStrength(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Parol kuchi:</span>
            <span className={`font-medium ${
              strength.label === 'Zaif' ? 'text-red-600' :
              strength.label === 'Oʻrtacha' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {strength.label}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
          {value.length < 6 && (
            <p className="text-xs text-red-600">
              Kamida 6 ta belgi
            </p>
          )}
        </div>
      )}
    </div>
  );
}
