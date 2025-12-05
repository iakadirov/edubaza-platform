'use client';

import React from 'react';

export type UserRole = 'TEACHER' | 'STUDENT' | 'PARENT';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  compact?: boolean; // Компактный режим в один ряд
}

const roles: { value: UserRole; label: string; icon: string; description: string }[] = [
  {
    value: 'TEACHER',
    label: 'Oʻqituvchi',
    icon: '👨‍🏫',
    description: 'Topshiriqlar yarating va kontent boshqaring',
  },
  {
    value: 'STUDENT',
    label: 'Oʻquvchi',
    icon: '👨‍🎓',
    description: 'Topshiriqlarni bajaring va natijalarni kuzating',
  },
  {
    value: 'PARENT',
    label: 'Ota-ona',
    icon: '👨‍👩‍👧',
    description: 'Farzandingizning rivojlanishini kuzating',
  },
];

export default function RoleSelector({ value, onChange, compact = false }: RoleSelectorProps) {
  if (compact) {
    // Компактный режим - в один ряд
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Men:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`
                flex flex-col items-center p-3 border-2 rounded-lg transition-all text-center
                ${
                  value === role.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="text-2xl mb-1">{role.icon}</div>
              <div className="text-xs font-semibold text-gray-900">{role.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Полный режим
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Men:
      </label>
      <div className="grid grid-cols-1 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={`
              relative flex items-center p-4 border-2 rounded-lg transition-all
              ${
                value === role.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-center flex-1">
              <div className="text-3xl mr-4">{role.icon}</div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-600">{role.description}</div>
              </div>
            </div>
            {value === role.value && (
              <div className="ml-4">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
